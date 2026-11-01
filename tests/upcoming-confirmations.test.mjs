import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const source=readFileSync(new URL('../lib/clinic-admin.ts',import.meta.url),'utf8');
const sql=source.split('export async function getUpcomingConfirmationAppointments')[1].match(/client\(\)`([\s\S]*?)`;/)[1].replaceAll('${location}','$1');
test('upcoming confirmations include all beauticians, exclude past and cancelled bookings, and retain sent state',async()=>{
 const db=new PGlite();try{
 await db.exec(`CREATE TABLE venux_clients(id INT,full_name TEXT,mobile TEXT,service_sms_consent BOOLEAN,sms_unsubscribed_at TIMESTAMPTZ);
 CREATE TABLE venux_staff(id INT,full_name TEXT);
 CREATE TABLE venux_appointments(id INT,client_id INT,staff_id INT,requested_date DATE,requested_time TEXT,start_minute INT,treatment TEXT,clinic TEXT,status TEXT,customer_confirmation_status TEXT,appointment_sms_enabled BOOLEAN);
 CREATE TABLE venux_sms_outbox(event_key TEXT,status TEXT);
 INSERT INTO venux_clients VALUES(1,'Test','0400000000',TRUE,NULL);
 INSERT INTO venux_staff VALUES(1,'Amy'),(2,'Tina');
 INSERT INTO venux_appointments VALUES
 (1,1,1,(NOW() AT TIME ZONE 'Australia/Sydney')::date+1,'10:00 AM',600,'Facial','Top Ryde','confirmed','pending',TRUE),
 (2,1,2,(NOW() AT TIME ZONE 'Australia/Sydney')::date+1,'10:00 AM',600,'Facial','Sydney City','confirmed','pending',TRUE),
 (3,1,1,(NOW() AT TIME ZONE 'Australia/Sydney')::date-1,'10:00 AM',600,'Facial','Top Ryde','confirmed','pending',TRUE),
 (4,1,1,(NOW() AT TIME ZONE 'Australia/Sydney')::date+1,'10:00 AM',600,'Facial','Top Ryde','cancelled','pending',TRUE),
 (5,1,1,(NOW() AT TIME ZONE 'Australia/Sydney')::date+8,'10:00 AM',600,'Facial','Top Ryde','confirmed','pending',TRUE);
 INSERT INTO venux_sms_outbox VALUES('appointment-confirmation:1','sent');`);
 const all=(await db.query(sql,[''])).rows;
 assert.deepEqual(all.map(r=>r.id),[1,2]);assert.equal(all[0].confirmation_sent,true);assert.equal(all[1].confirmation_sent,false);
 assert.deepEqual((await db.query(sql,['Top Ryde'])).rows.map(r=>r.id),[1]);
 assert.deepEqual((await db.query(sql,['City'])).rows.map(r=>r.id),[2]);
 }finally{await db.close();}
});
