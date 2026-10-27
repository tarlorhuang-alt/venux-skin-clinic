import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
async function load(path){const source=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);}
const {receiptSummary}=await load('../lib/receipt-summary.ts');
const {careSlugs}=await load('../lib/care-guides.ts');
test('partial payment, prepaid membership and package are not falsely recorded as new cash',()=>{
 assert.deepEqual(receiptSummary({total:159,deposit:50,paidNow:20,membership:0,packageUsed:false}),{received:70,balance:89});
 assert.deepEqual(receiptSummary({total:159,deposit:0,paidNow:0,membership:159,packageUsed:false}),{received:0,balance:0});
 assert.deepEqual(receiptSummary({total:399,deposit:0,paidNow:0,membership:0,packageUsed:true}),{received:0,balance:null});
 assert.deepEqual(receiptSummary({total:99.99,deposit:30,paidNow:69.99,membership:0,packageUsed:false}),{received:99.99,balance:0});
});
test('combination visit includes all care categories without duplicates',()=>{
 assert.deepEqual(careSlugs('PRP + Facial + IPL'),['prp','facial','ipl']);
 assert.deepEqual(careSlugs('HIFU & HIFU'),['hifu']);
 assert.deepEqual(careSlugs('Unmapped injection'),['general']);
});
test('receipt SQL snapshots actual values once, does not issue for unfinished appointments',async()=>{
 const db=new PGlite();try{
 await db.exec(`CREATE TABLE venux_clients(id bigint primary key,full_name text);CREATE TABLE venux_client_package_items(id bigint primary key,included_sessions int,used_sessions int);
 CREATE TABLE venux_appointments(id bigint primary key,client_id bigint,client_package_item_id bigint,treatment text,clinic text,completed_at timestamptz,total_amount numeric,deposit_status text,deposit_amount numeric,membership_balance_deducted_amount numeric,package_session_deducted_at timestamptz,status text);
 CREATE TABLE venux_visit_receipts(id bigserial primary key,appointment_id bigint unique,token text unique,snapshot jsonb);
 INSERT INTO venux_clients VALUES(1,'Test Client');INSERT INTO venux_appointments VALUES(1,1,null,'Facial','Top Ryde',NOW(),159,'paid',50,0,null,'completed'),(2,1,null,'Facial','City',null,159,'unpaid',50,0,null,'in_progress');`);
 const src=readFileSync(new URL('../lib/clinic-admin.ts',import.meta.url),'utf8');
 const raw=src.match(/await sql`(INSERT INTO venux_visit_receipts[\s\S]*?)`;/)[1];let index=0;
 const query=raw.replace(/\$\{[^}]+\}/g,()=>`$${++index}`);
 const args=['a'.repeat(48),109,'Card','',1];
 await db.query(query,args);await db.query(query,['b'.repeat(48),999,'Cash','',1]);await db.query(query,['c'.repeat(48),109,'Card','',2]);
 const result=await db.query('SELECT snapshot FROM venux_visit_receipts');assert.equal(result.rows.length,1);assert.equal(result.rows[0].snapshot.paidNow,109);assert.equal(result.rows[0].snapshot.deposit,50);assert.equal(result.rows[0].snapshot.method,'Card');
 }finally{await db.close();}
});
