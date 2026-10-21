import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
const source=readFileSync(new URL('../lib/clinic-admin.ts',import.meta.url),'utf8');
test('birthday job prepares only eligible promotions, sends none and cannot duplicate the same year',async()=>{
 const db=new PGlite();
 await db.exec(`CREATE TABLE venux_clients(id INT,full_name TEXT,mobile TEXT,dob DATE,marketing_sms_consent BOOLEAN,marketing_sms_enabled BOOLEAN,sms_unsubscribed_at TIMESTAMPTZ);
 INSERT INTO venux_clients VALUES
 (1,'Ready Client','0400000001','1990-10-21',TRUE,TRUE,NULL),
 (2,'No Consent','0400000002','1990-10-21',FALSE,TRUE,NULL),
 (3,'Disabled','0400000003','1990-10-21',TRUE,FALSE,NULL),
 (4,'Unsubscribed','0400000004','1990-10-21',TRUE,TRUE,NOW()),
 (5,'Another Birthday','0400000005','1990-10-22',TRUE,TRUE,NULL);
 CREATE TABLE venux_sms_outbox(id SERIAL,client_id INT,event_key TEXT UNIQUE,message_type TEXT,recipient TEXT,message_body TEXT);`);
 const sql=async(parts,...values)=>{
  const text=parts.map((part,index)=>part+(index<values.length?'$'+(index+1):'')).join('');
  return (await db.query(text,values)).rows;
 };
 class FixedDate extends Date{constructor(...args){super(...(args.length?args:['2026-10-21T00:00:00Z']));}}
 const start=source.indexOf('export async function queueBirthdayMessages()');
 const end=source.indexOf('export async function queueAppointmentReminders',start);
 const code=ts.transpileModule(source.slice(start,end),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};let sends=0;
 vm.runInNewContext(code,{exports,Date:FixedDate,ensureClinicTables:async()=>{},client:()=>sql,sendSmsOutboxMessage:()=>{sends++;throw Error('Birthday job must not send automatically')}});
 let result=await exports.queueBirthdayMessages();assert.equal(result.queued,1);assert.equal(result.sent,0);
 result=await exports.queueBirthdayMessages();assert.equal(result.queued,0);assert.equal(sends,0);
 const messages=(await db.query('SELECT client_id,message_body FROM venux_sms_outbox')).rows;
 assert.equal(messages.length,1);assert.equal(messages[0].client_id,1);assert.match(messages[0].message_body,/Reply STOP/);
 await db.close();
});
