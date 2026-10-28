import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const source=readFileSync(new URL('../lib/clinic-admin.ts',import.meta.url),'utf8');
const reminderSql=source.match(/const rows=await sql`(WITH scheduled AS [\s\S]*?)`;/)[1];
const db=new PGlite();
await db.exec(`CREATE TABLE venux_clients(id INT PRIMARY KEY,full_name TEXT,mobile TEXT,service_sms_consent BOOLEAN,sms_unsubscribed_at TIMESTAMPTZ);
CREATE TABLE venux_appointments(id INT PRIMARY KEY,client_id INT,requested_date DATE,requested_time TEXT,start_minute INT,status TEXT,customer_confirmation_status TEXT,treatment TEXT,aftercare_token TEXT,completed_at TIMESTAMPTZ,service_addons JSONB DEFAULT '[]'::jsonb,appointment_sms_enabled BOOLEAN DEFAULT TRUE);
INSERT INTO venux_clients(id,full_name,mobile,service_sms_consent) VALUES (1,'Test','0400000000',TRUE),(2,'No consent','0400000001',FALSE);`);
async function eligible(now,rows,mode="24h",appointmentId=null){
 await db.exec('DELETE FROM venux_appointments');
 for(const r of rows){
  await db.query('INSERT INTO venux_appointments(id,client_id,requested_date,requested_time,start_minute,status,customer_confirmation_status,appointment_sms_enabled) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[r.id,r.client??1,r.date,r.time??'10:00 AM',r.minutes??null,r.status??'confirmed',r.confirmation??'pending',r.enabled??true]);
 }
 const query=reminderSql.replaceAll('${appointmentId??null}',String(appointmentId??'NULL')).replaceAll('${mode}',`'${mode}'`).replaceAll('NOW()',`TIMESTAMPTZ '${now}'`);
 return (await db.query(query)).rows.map(r=>r.id).sort((a,b)=>a-b);
}
test('24h boundary includes exact due and late bookings but excludes future, past and opted-out states',async()=>{
 const rows=[
 {id:1,date:'2026-10-13',time:'10:00 AM'},
 {id:2,date:'2026-10-13',time:'10:01 AM'},
 {id:3,date:'2026-10-12',time:'10:00 AM'},
 {id:4,date:'2026-10-12',time:'11:00 AM'},
 {id:5,date:'2026-10-13',status:'cancelled'},
 {id:6,date:'2026-10-13',client:2},
 {id:7,date:'2026-10-13',confirmation:'change_requested'},
 {id:8,date:'2026-10-13',status:'completed'},
 {id:9,date:'2026-10-13',time:'invalid'},
 {id:10,date:'2026-10-13',time:'10:00 AM',minutes:600},
 ];
 assert.deepEqual(await eligible('2026-10-11 23:00:00+00',rows),[1,4,10]);
});
test('Sydney daylight saving start uses elapsed 24 hours, not tomorrow at a fixed UTC hour',async()=>{
 assert.deepEqual(await eligible('2026-10-02 16:00:00+00',[{id:1,date:'2026-10-04',time:'3:00 AM'}]),[1]);
 assert.deepEqual(await eligible('2026-10-02 15:59:00+00',[{id:1,date:'2026-10-04',time:'3:00 AM'}]),[]);
});
test('Sydney daylight saving end uses the new AEST offset',async()=>{
 assert.deepEqual(await eligible('2026-04-03 17:00:00+00',[{id:1,date:'2026-04-05',time:'3:00 AM'}]),[1]);
 assert.deepEqual(await eligible('2026-04-03 16:59:00+00',[{id:1,date:'2026-04-05',time:'3:00 AM'}]),[]);
});
test('aftercare token retrieves only completed treatment and no personal health data',async()=>{
 const token='a'.repeat(32);
 await db.exec('DELETE FROM venux_appointments');
 await db.query('INSERT INTO venux_appointments(id,status,treatment,aftercare_token) VALUES (1,$1,$2,$3)',['in_progress','Facial',token]);
 const sql=source.split('export async function getAftercareByToken')[1].match(/client\(\)`([\s\S]*?)`/)[1].replace('${token}','$1');
 assert.equal((await db.query(sql,[token])).rows.length,0);
 await db.exec("UPDATE venux_appointments SET status='completed'");
 assert.deepEqual(Object.keys((await db.query(sql,[token])).rows[0]).sort(),['completed_at','treatment']);
 await db.exec("UPDATE venux_appointments SET service_addons='[{\"name\":\"Skin Booster\",\"amount\":50}]'");
 assert.equal((await db.query(sql,[token])).rows[0].treatment,'Facial + Skin Booster');
 assert.equal((await db.query(sql,['b'.repeat(32)])).rows.length,0);
});
test('atomic sending claim prevents concurrent sends for the same queued message',async()=>{
 await db.exec("CREATE TABLE venux_sms_outbox(id INT,status TEXT,last_error TEXT,last_attempt_at TIMESTAMPTZ,attempt_count INT); INSERT INTO venux_sms_outbox VALUES(1,'queued',NULL,NULL,0)");
 const sql=source.match(/const claimed=await sql`(UPDATE venux_sms_outbox SET status='sending'[\s\S]*?)`;/)[1].replaceAll('${id}','$1');
 const results=await Promise.all([db.query(sql,[1]),db.query(sql,[1])]);
 assert.equal(results.reduce((sum,result)=>sum+result.rows.length,0),1);
 assert.equal((await db.query('SELECT attempt_count FROM venux_sms_outbox')).rows[0].attempt_count,1);
});
test('missed two-week follow-ups are recovered from completion date without duplicating or reopening them',async()=>{
 await db.exec(`CREATE TABLE venux_followups(client_id INT,appointment_id INT,due_date DATE,followup_type TEXT,status TEXT);
 CREATE UNIQUE INDEX followup_appointment ON venux_followups(appointment_id) WHERE appointment_id IS NOT NULL;
 DELETE FROM venux_appointments;
 INSERT INTO venux_appointments(id,client_id,status,completed_at) VALUES (20,1,'completed','2026-10-13 14:30:00+00'),(21,1,'in_progress',NULL);`);
 const sql=source.match(/await client\(\)`(INSERT INTO venux_followups[\s\S]*?)`;/)[1];
 await db.exec(sql);
 let rows=(await db.query('SELECT appointment_id,due_date::text,status FROM venux_followups')).rows;
 assert.deepEqual(rows,[{appointment_id:20,due_date:'2026-10-28',status:'pending'}]);
 await db.exec("UPDATE venux_followups SET status='completed'");
 await db.exec(sql);
 rows=(await db.query('SELECT appointment_id,status FROM venux_followups')).rows;
 assert.deepEqual(rows,[{appointment_id:20,status:'completed'}]);
});

test('daily Hobby task includes tomorrow and catches missed future bookings today, but excludes later days',async()=>{
 const rows=[{id:1,date:'2026-10-13',time:'10:00 AM'},{id:2,date:'2026-10-13',time:'8:00 PM'},{id:3,date:'2026-10-14',time:'10:00 AM'},{id:4,date:'2026-10-12',time:'11:00 AM'},{id:5,date:'2026-10-13',client:2}];
 assert.deepEqual(await eligible('2026-10-11 22:00:00+00',rows,'previous-day'),[1,2,4]);
});

test('immediate late-booking check targets only the new appointment',async()=>{
 const rows=[{id:1,date:'2026-10-13'},{id:2,date:'2026-10-13'}];
 assert.deepEqual(await eligible('2026-10-11 22:00:00+00',rows,'previous-day',2),[2]);
});

test('an appointment-level SMS switch can disable sending even when the client has consent',async()=>{
 assert.deepEqual(await eligible('2026-10-11 22:00:00+00',[{id:1,date:'2026-10-13',enabled:false},{id:2,date:'2026-10-13',enabled:true}],'previous-day'),[2]);
});

test('unsubscribed clients do not receive appointment reminders',async()=>{
 await db.exec("UPDATE venux_clients SET sms_unsubscribed_at=NOW() WHERE id=1");
 try{assert.deepEqual(await eligible('2026-10-11 22:00:00+00',[{id:1,date:'2026-10-13'}],'previous-day'),[]);}
 finally{await db.exec("UPDATE venux_clients SET sms_unsubscribed_at=NULL WHERE id=1");}
});
