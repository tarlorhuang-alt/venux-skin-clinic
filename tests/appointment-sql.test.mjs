import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const source=readFileSync(new URL('../lib/clinic-admin.ts',import.meta.url),'utf8');
const reminderSql=source.match(/const rows=await sql`(WITH scheduled AS [\s\S]*?)`;/)[1];
const db=new PGlite();
await db.exec(`CREATE TABLE venux_clients(id INT PRIMARY KEY,full_name TEXT,mobile TEXT,service_sms_consent BOOLEAN);
CREATE TABLE venux_appointments(id INT PRIMARY KEY,client_id INT,requested_date DATE,requested_time TEXT,start_minute INT,status TEXT,customer_confirmation_status TEXT,treatment TEXT,aftercare_token TEXT,completed_at TIMESTAMPTZ);
INSERT INTO venux_clients VALUES (1,'Test','0400000000',TRUE),(2,'No consent','0400000001',FALSE);`);
async function eligible(now,rows){
 await db.exec('DELETE FROM venux_appointments');
 for(const r of rows){
  await db.query('INSERT INTO venux_appointments(id,client_id,requested_date,requested_time,start_minute,status,customer_confirmation_status) VALUES ($1,$2,$3,$4,$5,$6,$7)',[r.id,r.client??1,r.date,r.time??'10:00 AM',r.minutes??null,r.status??'confirmed',r.confirmation??'pending']);
 }
 const query=reminderSql.replaceAll('NOW()',`TIMESTAMPTZ '${now}'`);
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
 const sql=source.match(/SELECT treatment,completed_at FROM venux_appointments WHERE aftercare_token=\$\{token\} AND status='completed' LIMIT 1/)[0].replace('${token}','$1');
 assert.equal((await db.query(sql,[token])).rows.length,0);
 await db.exec("UPDATE venux_appointments SET status='completed'");
 assert.deepEqual(Object.keys((await db.query(sql,[token])).rows[0]).sort(),['completed_at','treatment']);
 assert.equal((await db.query(sql,['b'.repeat(32)])).rows.length,0);
});
test('atomic sending claim prevents concurrent sends for the same queued message',async()=>{
 await db.exec("CREATE TABLE venux_sms_outbox(id INT,status TEXT,last_error TEXT,last_attempt_at TIMESTAMPTZ,attempt_count INT); INSERT INTO venux_sms_outbox VALUES(1,'queued',NULL,NULL,0)");
 const sql=source.match(/const claimed=await sql`(UPDATE venux_sms_outbox SET status='sending'[\s\S]*?)`;/)[1].replaceAll('${id}','$1');
 const results=await Promise.all([db.query(sql,[1]),db.query(sql,[1])]);
 assert.equal(results.reduce((sum,result)=>sum+result.rows.length,0),1);
 assert.equal((await db.query('SELECT attempt_count FROM venux_sms_outbox')).rows[0].attempt_count,1);
});
