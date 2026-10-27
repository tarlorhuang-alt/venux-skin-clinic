// One statement locks and settles the visit, its card/package and immutable receipt.
// $1 appointment, $2 staff, $3 comment, $4 membership, $5 package item,
// $6 add-ons JSON, $7 payments JSON, $8 photo, $9 photo name, $10 receipt token, $11 ABN.
export const SERVICE_CHECKOUT_SQL=`WITH locked AS MATERIALIZED (
 SELECT a.* FROM venux_appointments a WHERE a.id=$1 AND a.status='in_progress' AND a.staff_id=$2 FOR UPDATE OF a
), member AS MATERIALIZED (
 SELECT m.* FROM venux_memberships m JOIN locked a ON a.client_id=m.client_id WHERE m.status='active' FOR UPDATE OF m
), package_item AS MATERIALIZED (
 SELECT i.* FROM venux_client_package_items i JOIN venux_client_packages cp ON cp.id=i.client_package_id
 JOIN venux_services s ON s.id=i.service_id JOIN locked a ON a.client_id=cp.client_id
 WHERE i.id=$5::bigint AND cp.status='active' AND (cp.expires_on IS NULL OR cp.expires_on>=(NOW() AT TIME ZONE 'Australia/Sydney')::date)
 AND i.used_sessions<i.included_sessions AND (i.service_id=a.service_id OR (a.service_id IS NULL AND LOWER(s.service_name)=LOWER(a.treatment)))
 FOR UPDATE OF i,cp
), priced AS (
 SELECT a.*,CASE WHEN a.deposit_status='paid' THEN a.deposit_amount ELSE 0 END AS paid_deposit,
 COALESCE((SELECT SUM(amount) FROM jsonb_to_recordset($6::jsonb) AS x(name text,amount numeric)),0) AS addon_total,
 COALESCE((SELECT SUM(amount) FROM jsonb_to_recordset($7::jsonb) AS x(method text,amount numeric)),0) AS paid_now,
 CASE WHEN $5::bigint IS NOT NULL THEN GREATEST(0,a.total_amount-CASE WHEN a.deposit_status='paid' THEN a.deposit_amount ELSE 0 END) ELSE 0 END AS package_credit
 FROM locked a
), valid AS MATERIALIZED (
 SELECT a.* FROM priced a WHERE ($5::bigint IS NULL OR EXISTS(SELECT 1 FROM package_item))
 AND $4::numeric>=0 AND $4::numeric<=COALESCE((SELECT balance FROM member),0)
 AND $4::numeric+a.paid_now<=GREATEST(0,a.total_amount+a.addon_total-a.paid_deposit-a.package_credit)
 AND length(trim($3::text))>0 AND NOT EXISTS(SELECT 1 FROM venux_visit_receipts r WHERE r.appointment_id=a.id)
), debit AS (
 UPDATE venux_memberships m SET balance=m.balance-$4::numeric,updated_at=NOW() FROM valid a
 WHERE m.client_id=a.client_id AND $4::numeric>0 RETURNING m.client_id
), used AS (
 UPDATE venux_client_package_items i SET used_sessions=i.used_sessions+1 FROM valid a
 WHERE i.id=$5::bigint RETURNING i.id,i.client_package_id,i.included_sessions-i.used_sessions AS remaining
), completed AS (
 UPDATE venux_appointments a SET status='completed',completed_at=NOW(),updated_at=NOW(),
 total_amount=v.total_amount+v.addon_total,recognised_revenue=v.total_amount+v.addon_total,
 completion_comment=$3,explicit_checkout=TRUE,service_addons=$6::jsonb,checkout_payments=$7::jsonb,
 membership_balance_deducted_amount=$4::numeric,membership_balance_deducted_at=CASE WHEN $4::numeric>0 THEN NOW() ELSE NULL END,
 client_package_item_id=$5::bigint,package_session_deducted_at=CASE WHEN $5::bigint IS NOT NULL THEN NOW() ELSE NULL END,
 package_credit_amount=v.package_credit,wage_project_rate=0,staff_wage_amount=0,
 after_photo_data_url=COALESCE($8::text,a.after_photo_data_url),after_photo_name=COALESCE($9::text,a.after_photo_name),
 after_photo_uploaded_at=CASE WHEN $8::text IS NOT NULL THEN NOW() ELSE a.after_photo_uploaded_at END
 FROM valid v WHERE a.id=v.id AND ($4::numeric=0 OR EXISTS(SELECT 1 FROM debit))
 AND ($5::bigint IS NULL OR EXISTS(SELECT 1 FROM used)) RETURNING a.*
), package_finished AS (
 UPDATE venux_client_packages cp SET status='completed' FROM used u WHERE cp.id=u.client_package_id
 AND NOT EXISTS(SELECT 1 FROM venux_client_package_items i WHERE i.client_package_id=cp.id
 AND i.used_sessions+CASE WHEN i.id=u.id THEN 1 ELSE 0 END<i.included_sessions) RETURNING cp.id
), receipt AS (
 INSERT INTO venux_visit_receipts (appointment_id,token,snapshot)
 SELECT a.id,$10,jsonb_build_object('name',c.full_name,
 'treatment',a.treatment||COALESCE((SELECT ' + '||string_agg(name,' + ') FROM jsonb_to_recordset($6::jsonb) AS x(name text,amount numeric)),''),
 'clinic',a.clinic,'completedAt',a.completed_at,'total',a.total_amount,
 'deposit',CASE WHEN a.deposit_status='paid' THEN a.deposit_amount ELSE 0 END,
 'membership',a.membership_balance_deducted_amount,'packageUsed',$5::bigint IS NOT NULL,
 'packageCredit',a.package_credit_amount,'packageRemaining',(SELECT remaining FROM used),
 'paidNow',v.paid_now,'method',CASE WHEN jsonb_array_length($7::jsonb)>1 THEN 'Combination' WHEN v.paid_now=0 THEN 'No new payment' ELSE $7::jsonb->0->>'method' END,
 'payments',$7::jsonb,'addOns',$6::jsonb,'abn',$11::text,
 'accountTransactions',COALESCE((SELECT jsonb_agg(jsonb_build_object('type',event_type,'amount',amount,'method',payment_method) ORDER BY id) FROM venux_service_account_events WHERE appointment_id=a.id),'[]'::jsonb))
 FROM completed a JOIN venux_clients c ON c.id=a.client_id JOIN valid v ON v.id=a.id
 ON CONFLICT (appointment_id) DO NOTHING RETURNING id
), followup AS (
 INSERT INTO venux_followups (client_id,appointment_id,due_date,followup_type,status)
 SELECT client_id,id,(completed_at AT TIME ZONE 'Australia/Sydney')::date+14,'Two-week treatment follow-up','pending' FROM completed
 ON CONFLICT (appointment_id) WHERE appointment_id IS NOT NULL DO NOTHING RETURNING id
), freed AS (DELETE FROM venux_booking_slots WHERE appointment_id IN(SELECT id FROM completed) RETURNING appointment_id),
 logged AS (INSERT INTO venux_audit_log (action,entity_type,entity_id,detail)
 SELECT 'service_checkout','client',client_id,'Visit '||id||' settled with itemised payments and add-ons' FROM completed RETURNING id)
 SELECT id FROM completed`;

// Unique form key makes double-submitted purchases/recharges harmless.
// $1 appointment, $2 key, $3 kind, $4 amount, $5 method, $6 template.
export const SERVICE_ACCOUNT_SQL=`WITH locked AS MATERIALIZED (
 SELECT a.* FROM venux_appointments a WHERE a.id=$1 AND a.status IN('confirmed','in_progress') FOR UPDATE OF a
), template AS MATERIALIZED (
 SELECT p.* FROM venux_packages p WHERE p.id=$6::bigint AND p.active=TRUE
 AND EXISTS(SELECT 1 FROM venux_package_items WHERE package_id=p.id) FOR SHARE OF p
), event AS (
 INSERT INTO venux_service_account_events (appointment_id,client_id,event_key,event_type,amount,payment_method,package_id)
 SELECT a.id,a.client_id,$2,$3,$4,$5,$6::bigint FROM locked a
 WHERE ($3='recharge' AND $4::numeric>0) OR ($3='package' AND EXISTS(SELECT 1 FROM template) AND $4::numeric>=0)
 ON CONFLICT (event_key) DO NOTHING RETURNING *
), recharge AS (
 INSERT INTO venux_memberships (client_id,balance,status,joined_at)
 SELECT client_id,amount,'active',NOW() FROM event WHERE event_type='recharge'
 ON CONFLICT (client_id) DO UPDATE SET balance=venux_memberships.balance+EXCLUDED.balance,status='active',updated_at=NOW() RETURNING client_id
), purchased AS (
 INSERT INTO venux_client_packages (client_id,package_id,purchased_on,expires_on,amount_paid)
 SELECT e.client_id,p.id,(NOW() AT TIME ZONE 'Australia/Sydney')::date,(NOW() AT TIME ZONE 'Australia/Sydney')::date+p.validity_days,e.amount
 FROM event e CROSS JOIN template p WHERE e.event_type='package' RETURNING id,package_id
), items AS (
 INSERT INTO venux_client_package_items (client_package_id,service_id,included_sessions)
 SELECT p.id,i.service_id,i.included_sessions FROM purchased p JOIN venux_package_items i ON i.package_id=p.package_id RETURNING id
), logged AS (
 INSERT INTO venux_audit_log (action,entity_type,entity_id,detail)
 SELECT 'service_account_'||event_type,'client',client_id,'Visit '||appointment_id||': $'||amount||' via '||payment_method FROM event RETURNING id
) SELECT id FROM event`;
