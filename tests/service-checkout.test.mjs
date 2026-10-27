import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
async function load(path){const code=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));}
const {RECORDED_RECEIPT_SQL}=await load('../lib/recorded-receipt-sql.ts');
const {SERVICE_CHECKOUT_SQL,SERVICE_ACCOUNT_SQL}=await load('../lib/service-checkout-sql.ts');
const {parseServiceCheckout}=await load('../lib/service-checkout.ts');
const {receiptSummary}=await load('../lib/receipt-summary.ts');
async function fixture(){
 const db=new PGlite();
 await db.exec(`CREATE TABLE venux_clients(id BIGINT PRIMARY KEY,full_name TEXT);
 CREATE TABLE venux_memberships(client_id BIGINT PRIMARY KEY,balance NUMERIC CHECK(balance>=0),status TEXT,joined_at TIMESTAMPTZ,updated_at TIMESTAMPTZ);
 CREATE TABLE venux_services(id BIGINT PRIMARY KEY,service_name TEXT);
 CREATE TABLE venux_packages(id BIGINT PRIMARY KEY,package_name TEXT,validity_days INT,active BOOLEAN);
 CREATE TABLE venux_package_items(package_id BIGINT,service_id BIGINT,included_sessions INT);
 CREATE TABLE venux_client_packages(id BIGSERIAL PRIMARY KEY,client_id BIGINT,package_id BIGINT,status TEXT DEFAULT 'active',purchased_on DATE,expires_on DATE,amount_paid NUMERIC);
 CREATE TABLE venux_client_package_items(id BIGSERIAL PRIMARY KEY,client_package_id BIGINT,service_id BIGINT,included_sessions INT,used_sessions INT DEFAULT 0 CHECK(used_sessions<=included_sessions));
 CREATE TABLE venux_appointments(id BIGINT PRIMARY KEY,client_id BIGINT,staff_id BIGINT,service_id BIGINT,status TEXT,treatment TEXT,clinic TEXT,total_amount NUMERIC,deposit_status TEXT,deposit_amount NUMERIC,
 completed_at TIMESTAMPTZ,updated_at TIMESTAMPTZ,recognised_revenue NUMERIC,completion_comment TEXT,explicit_checkout BOOLEAN DEFAULT FALSE,service_addons JSONB,checkout_payments JSONB,
 membership_balance_deducted_amount NUMERIC DEFAULT 0,membership_balance_deducted_at TIMESTAMPTZ,client_package_item_id BIGINT,package_session_deducted_at TIMESTAMPTZ,package_credit_amount NUMERIC,
 wage_project_rate NUMERIC,staff_wage_amount NUMERIC,after_photo_data_url TEXT,after_photo_name TEXT,after_photo_uploaded_at TIMESTAMPTZ);
 CREATE TABLE venux_visit_receipts(id BIGSERIAL PRIMARY KEY,appointment_id BIGINT UNIQUE,token TEXT UNIQUE,snapshot JSONB);
 CREATE TABLE venux_followups(id BIGSERIAL PRIMARY KEY,client_id BIGINT,appointment_id BIGINT,due_date DATE,followup_type TEXT,status TEXT);
 CREATE UNIQUE INDEX followup_appointment ON venux_followups(appointment_id) WHERE appointment_id IS NOT NULL;
 CREATE TABLE venux_booking_slots(appointment_id BIGINT);
 CREATE TABLE venux_audit_log(id BIGSERIAL PRIMARY KEY,action TEXT,entity_type TEXT,entity_id BIGINT,detail TEXT);
 CREATE TABLE venux_service_account_events(id BIGSERIAL PRIMARY KEY,appointment_id BIGINT,client_id BIGINT,event_key TEXT UNIQUE,event_type TEXT,amount NUMERIC,payment_method TEXT,package_id BIGINT);
 INSERT INTO venux_clients VALUES(1,'Client One'),(2,'Client Two');
 INSERT INTO venux_memberships VALUES(1,100,'active',NOW(),NOW());
 INSERT INTO venux_services VALUES(1,'Facial'),(2,'IPL');INSERT INTO venux_packages VALUES(1,'Facial course',365,TRUE);
 INSERT INTO venux_package_items VALUES(1,1,3);
 INSERT INTO venux_client_packages(client_id,package_id,expires_on) VALUES(1,1,CURRENT_DATE+30),(2,1,CURRENT_DATE+30);
 INSERT INTO venux_client_package_items(client_package_id,service_id,included_sessions) VALUES(1,1,2),(2,1,2);
 INSERT INTO venux_appointments(id,client_id,staff_id,service_id,status,treatment,clinic,total_amount,deposit_status,deposit_amount)
 VALUES(1,1,7,1,'in_progress','Facial','Top Ryde',200,'paid',50),(2,1,7,1,'in_progress','Facial','Top Ryde',200,'paid',50);
 INSERT INTO venux_booking_slots VALUES(1),(2);`);
 return db;
}
const checkout=(overrides={})=>({membership:0,packageId:null,addons:[],payments:[],...overrides});
async function settle(db,id=1,options=checkout(),staff=7){return db.query(SERVICE_CHECKOUT_SQL,[id,staff,'Skin recovering well',options.membership,options.packageId,JSON.stringify(options.addons),JSON.stringify(options.payments),null,null,'receipt-'+id,'']);}
async function balance(db){return Number((await db.query('SELECT balance FROM venux_memberships WHERE client_id=1')).rows[0].balance);}

test('checkout parser accepts split amounts and rejects malformed money, negative values and unnamed add-ons',()=>{
 const form=new FormData();form.set('membershipUsed','20.25');form.set('cash','10');form.set('card','9.75');form.set('addOnName0','Serum');form.set('addOnAmount0','15');
 const value=parseServiceCheckout(form);assert.equal(value.membership,20.25);assert.deepEqual(value.payments,[{method:'Cash',amount:10},{method:'Card',amount:9.75}]);assert.equal(value.addOns[0].name,'Serum');
 for(const invalid of ['-1','NaN','1.001','1e2']){form.set('cash',invalid);assert.throws(()=>parseServiceCheckout(form));}
 form.set('cash','0');form.set('addOnName0','');assert.throws(()=>parseServiceCheckout(form));
});

test('membership plus cash/card and add-ons settle together and are itemised on the receipt',async()=>{
 const db=await fixture();try{
 const options=checkout({membership:80,addons:[{name:'Serum add-on',amount:30}],payments:[{method:'Cash',amount:40},{method:'Card',amount:60}]});
 assert.equal((await settle(db,1,options)).rows.length,1);assert.equal(await balance(db),20);
 const value=(await db.query('SELECT snapshot FROM venux_visit_receipts')).rows[0].snapshot;
 assert.equal(value.total,230);assert.equal(value.paidNow,100);assert.equal(value.membership,80);assert.equal(value.method,'Combination');assert.equal(value.addOns[0].name,'Serum add-on');assert.equal(value.payments.length,2);
 assert.deepEqual(receiptSummary(value),{received:150,balance:0});
 assert.equal((await db.query('SELECT * FROM venux_followups')).rows.length,1);
 assert.equal((await db.query('SELECT * FROM venux_booking_slots WHERE appointment_id=1')).rows.length,0);
 }finally{await db.close();}
});

test('package covers only the base treatment; member/card pay add-ons without consuming a second session',async()=>{
 const db=await fixture();try{
 const options=checkout({packageId:1,membership:10,addons:[{name:'Extra care',amount:30}],payments:[{method:'Card',amount:20}]});
 assert.equal((await settle(db,1,options)).rows.length,1);assert.equal(await balance(db),90);
 assert.equal((await db.query('SELECT used_sessions FROM venux_client_package_items WHERE id=1')).rows[0].used_sessions,1);
 const value=(await db.query('SELECT snapshot FROM venux_visit_receipts')).rows[0].snapshot;
 assert.equal(value.packageCredit,150);assert.equal(value.packageRemaining,1);assert.deepEqual(receiptSummary(value),{received:70,balance:0});
 }finally{await db.close();}
});

test('invalid checkout does not deduct funds, consume sessions, complete a service or issue a receipt',async()=>{
 const db=await fixture();try{
 for(const options of [checkout({membership:101}),checkout({payments:[{method:'Card',amount:151}]}),checkout({packageId:2}),checkout({packageId:999})])assert.equal((await settle(db,1,options)).rows.length,0);
 assert.equal((await settle(db,1,checkout(),8)).rows.length,0);
 await db.exec("UPDATE venux_client_packages SET expires_on=CURRENT_DATE-1 WHERE id=1");assert.equal((await settle(db,1,checkout({packageId:1}))).rows.length,0);
 await db.exec("UPDATE venux_client_packages SET expires_on=CURRENT_DATE+30 WHERE id=1;UPDATE venux_client_package_items SET service_id=2 WHERE id=1");assert.equal((await settle(db,1,checkout({packageId:1}))).rows.length,0);
 assert.equal(await balance(db),100);assert.equal((await db.query('SELECT used_sessions FROM venux_client_package_items WHERE id=1')).rows[0].used_sessions,0);
 assert.equal((await db.query('SELECT status FROM venux_appointments WHERE id=1')).rows[0].status,'in_progress');assert.equal((await db.query('SELECT * FROM venux_visit_receipts')).rows.length,0);
 await db.exec("INSERT INTO venux_visit_receipts(appointment_id,token,snapshot) VALUES(1,'old-receipt','{}')");
 assert.equal((await settle(db,1,checkout({membership:10}))).rows.length,0);assert.equal(await balance(db),100);
 }finally{await db.close();}
});

test('repeat submissions settle once, and two visits cannot overspend a shared membership or final package session',async()=>{
 const db=await fixture();try{
 const results=await Promise.all([settle(db,1,checkout({membership:80})),settle(db,1,checkout({membership:80}))]);assert.equal(results.reduce((n,r)=>n+r.rows.length,0),1);assert.equal(await balance(db),20);
 assert.equal((await settle(db,2,checkout({membership:80}))).rows.length,0);
 assert.equal((await db.query('SELECT * FROM venux_visit_receipts')).rows.length,1);
 await db.exec('UPDATE venux_client_package_items SET used_sessions=1 WHERE id=1');
 await db.exec("INSERT INTO venux_appointments(id,client_id,staff_id,service_id,status,treatment,clinic,total_amount,deposit_status,deposit_amount) VALUES(3,1,7,1,'in_progress','Facial','Top Ryde',200,'paid',50)");
 const uses=await Promise.all([settle(db,2,checkout({packageId:1})),settle(db,3,checkout({packageId:1}))]);
 assert.equal(uses.reduce((sum,result)=>sum+result.rows.length,0),1);assert.equal((await db.query('SELECT status FROM venux_client_packages WHERE id=1')).rows[0].status,'completed');
 }finally{await db.close();}
});

test('any SQL failure rolls back balances and completion together',async()=>{
 const db=await fixture();try{
 await db.exec("ALTER TABLE venux_visit_receipts ADD CONSTRAINT fail_receipt CHECK(token<>'receipt-1')");
 await assert.rejects(()=>settle(db,1,checkout({membership:50})));
 assert.equal(await balance(db),100);assert.equal((await db.query('SELECT status FROM venux_appointments WHERE id=1')).rows[0].status,'in_progress');
 assert.equal((await db.query('SELECT * FROM venux_audit_log')).rows.length,0);
 }finally{await db.close();}
});

test('inline recharges and package purchases are recorded once and cannot run after completion',async()=>{
 const db=await fixture();try{
 const args=[1,'unique-recharge-key','recharge',200,'Card',null];
 await db.query(SERVICE_ACCOUNT_SQL,args);await db.query(SERVICE_ACCOUNT_SQL,args);assert.equal(await balance(db),300);
 const purchase=[1,'unique-purchase-key','package',500,'Cash',1];await db.query(SERVICE_ACCOUNT_SQL,purchase);await db.query(SERVICE_ACCOUNT_SQL,purchase);
 assert.equal((await db.query('SELECT * FROM venux_client_packages WHERE client_id=1')).rows.length,2);
 assert.equal((await db.query('SELECT * FROM venux_service_account_events')).rows.length,2);
 const source=readFileSync(new URL('../lib/clinic-admin.ts',import.meta.url),'utf8');
 const query=source.match(/return client\(\)`(SELECT a.id,COALESCE\(m.balance,0\) AS membership_balance,[\s\S]*?)`;/)[1].replace('${appointmentIds}','$1');
 const account=(await db.query(query,[[1]])).rows[0];assert.equal(Number(account.membership_balance),300);assert.equal(account.packages.length,2);assert.equal(account.account_events.length,2);

 await settle(db);assert.equal((await db.query(SERVICE_ACCOUNT_SQL,[1,'late-recharge','recharge',10,'Cash',null])).rows.length,0);assert.equal(await balance(db),300);
 const value=(await db.query('SELECT snapshot FROM venux_visit_receipts')).rows[0].snapshot;assert.equal(value.accountTransactions.length,2);assert.equal(value.paidNow,0);
 }finally{await db.close();}
});


test('missing receipts use actual recorded payments without deducting card funds or package sessions',async()=>{
 const db=await fixture();try{
 await db.exec("UPDATE venux_appointments SET status='completed',completed_at=NOW(),membership_balance_deducted_amount=50 WHERE id=1;UPDATE venux_memberships SET balance=50 WHERE client_id=1");
 const args=[1,'recovered-token',JSON.stringify([{method:'Cash',amount:40},{method:'Card',amount:60}]),''];
 assert.equal((await db.query(RECORDED_RECEIPT_SQL,[1,'overpayment',JSON.stringify([{method:'Card',amount:101}]),''])).rows.length,0);
 assert.equal((await db.query(RECORDED_RECEIPT_SQL,args)).rows.length,1);
 await db.query(RECORDED_RECEIPT_SQL,[1,'another-token',JSON.stringify([{method:'Card',amount:0}]),'']);
 assert.equal((await db.query(RECORDED_RECEIPT_SQL,[2,'unfinished','[]',''])).rows.length,0);
 const records=(await db.query('SELECT token,snapshot FROM venux_visit_receipts')).rows;
 assert.equal(records.length,1);assert.equal(records[0].token,'recovered-token');assert.equal(records[0].snapshot.paidNow,100);
 assert.deepEqual(receiptSummary(records[0].snapshot),{received:150,balance:0});assert.equal(await balance(db),50);
 assert.equal((await db.query('SELECT used_sessions FROM venux_client_package_items WHERE id=1')).rows[0].used_sessions,0);
 }finally{await db.close();}
});

test('recreating an explicit checkout receipt reuses its saved payments instead of new form amounts',async()=>{
 const db=await fixture();try{
 await settle(db,1,checkout({membership:50,payments:[{method:'Card',amount:100}]}));
 await db.exec('DELETE FROM venux_visit_receipts');
 assert.equal((await db.query(RECORDED_RECEIPT_SQL,[1,'recreated','[{"method":"Cash","amount":999}]',''])).rows.length,1);
 const value=(await db.query('SELECT snapshot FROM venux_visit_receipts')).rows[0].snapshot;
 assert.equal(value.paidNow,100);assert.equal(value.method,'Card');assert.equal(await balance(db),50);
 }finally{await db.close();}
});

test('receipt list includes completed appointments without a receipt so staff can recover them',async()=>{
 const db=await fixture();try{
 await db.exec("ALTER TABLE venux_clients ADD COLUMN service_sms_consent BOOLEAN DEFAULT TRUE;ALTER TABLE venux_clients ADD COLUMN sms_unsubscribed_at TIMESTAMPTZ;ALTER TABLE venux_appointments ADD COLUMN appointment_sms_enabled BOOLEAN DEFAULT TRUE;ALTER TABLE venux_visit_receipts ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();CREATE TABLE venux_sms_outbox(id INT,event_key TEXT,status TEXT,last_error TEXT);UPDATE venux_appointments SET status='completed',completed_at=NOW() WHERE id=1");
 const source=readFileSync(new URL('../lib/clinic-admin.ts',import.meta.url),'utf8').split('export async function getVisitDeliveries')[1];
 const query=source.match(/return client\(\)`([\s\S]*?)`;/)[1].replaceAll('${location}','$1');
 let rows=(await db.query(query,['Top Ryde'])).rows;assert.equal(rows.length,1);assert.equal(rows[0].id,1);assert.equal(rows[0].token,null);
 await db.query(RECORDED_RECEIPT_SQL,[1,'receipt-recovered','[]','']);
 rows=(await db.query(query,['Top Ryde'])).rows;assert.equal(rows[0].token,'receipt-recovered');
 }finally{await db.close();}
});
