// Create an immutable receipt from recorded figures, without changing any account balance or session.
// $1 appointment, $2 private token, $3 actual payments JSON, $4 ABN.
export const RECORDED_RECEIPT_SQL=`WITH recorded AS (
 SELECT a.*,CASE WHEN a.explicit_checkout THEN a.checkout_payments ELSE $3::jsonb END AS payments,
 CASE WHEN a.deposit_status='paid' THEN a.deposit_amount ELSE 0 END AS paid_deposit
 FROM venux_appointments a WHERE a.id=$1 AND a.status='completed'
), priced AS (
 SELECT a.*,COALESCE((SELECT SUM(amount) FROM jsonb_to_recordset(a.payments) AS x(method text,amount numeric)),0) AS paid_now
 FROM recorded a
)
INSERT INTO venux_visit_receipts (appointment_id,token,snapshot)
 SELECT a.id,$2,jsonb_build_object('name',c.full_name,
 'treatment',a.treatment||COALESCE((SELECT ' + '||string_agg(name,' + ') FROM jsonb_to_recordset(a.service_addons) AS x(name text,amount numeric)),''),
 'clinic',a.clinic,'completedAt',COALESCE(a.completed_at,a.updated_at),'total',a.total_amount,'deposit',a.paid_deposit,
 'membership',a.membership_balance_deducted_amount,'packageUsed',a.package_session_deducted_at IS NOT NULL,
 'packageRemaining',CASE WHEN a.package_session_deducted_at IS NOT NULL THEN pi.included_sessions-pi.used_sessions ELSE NULL END,
 'paidNow',a.paid_now,'method',CASE WHEN jsonb_array_length(a.payments)>1 THEN 'Combination' WHEN a.paid_now=0 THEN 'No new payment' ELSE a.payments->0->>'method' END,
 'payments',a.payments,'addOns',a.service_addons,'abn',$4::text)
 || CASE WHEN a.explicit_checkout THEN jsonb_build_object('packageCredit',a.package_credit_amount) ELSE '{}'::jsonb END
 FROM priced a JOIN venux_clients c ON c.id=a.client_id LEFT JOIN venux_client_package_items pi ON pi.id=a.client_package_item_id
 WHERE a.paid_now>=0 AND (a.explicit_checkout OR a.paid_now<=GREATEST(0,a.total_amount-a.paid_deposit-a.membership_balance_deducted_amount-
 CASE WHEN a.package_session_deducted_at IS NOT NULL THEN GREATEST(0,a.total_amount-a.paid_deposit-a.membership_balance_deducted_amount) ELSE 0 END))
 ON CONFLICT (appointment_id) DO NOTHING RETURNING token`;
