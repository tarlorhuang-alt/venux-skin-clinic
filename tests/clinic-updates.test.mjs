import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {PGlite} from '@electric-sql/pglite';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function load(path,mocks={}){
 const exports={};
 const code=ts.transpileModule(read(path),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,Date,Set,Map,Math,Number,String,Array,Promise,require:id=>{
  if(id.endsWith('.css'))return {};
  if(id==='./schedule-view')return {default:({children})=>jsx.jsx('div',{children})};
  if(id==='react/jsx-runtime')return jsx;
  if(id.includes('calendar-schedule'))return load('lib/calendar-schedule.ts');
  for(const [match,value] of Object.entries(mocks))if(id.includes(match))return value;
  throw Error('Unexpected import '+id);
 }});
 return exports;
}
const catalogue=load('lib/legacy-image-services.ts');
test('image transcription preserves package names without interpreting package counts as minutes',()=>{
 assert.ok(catalogue.IMAGE_SERVICE_NAMES.length>85);
 assert.equal(new Set(catalogue.IMAGE_SERVICE_NAMES.map(name=>name.toLowerCase())).size,catalogue.IMAGE_SERVICE_NAMES.length);
 assert.equal(catalogue.imageServiceDuration('3* Paris Facial + BCN Serum Infusion'),60);
 assert.equal(catalogue.imageServiceDuration('15min (face massage)'),15);
 assert.equal(catalogue.imageServiceDuration('45min facial+45min massage'),90);
 assert.equal(catalogue.imageServiceDuration('30 min body massage + 30 min mini facial'),60);
 assert.equal(catalogue.imageServiceCategory('Day off'),'Schedule / administration');
});
test('image service import is repeatable and preserves existing clinic prices',async()=>{
 const db=new PGlite();
 await db.exec(`CREATE TABLE venux_services(service_name TEXT,category TEXT,duration_minutes INT,regular_price NUMERIC,price_notes TEXT,price_required BOOLEAN);
 CREATE UNIQUE INDEX service_name_unique ON venux_services(LOWER(service_name));
 INSERT INTO venux_services VALUES('DMK 1','Existing',90,220,'Verified',FALSE);`);
 const source=read('lib/clinic-admin.ts');
 const sql=source.match(/await sql`(INSERT INTO venux_services\(service_name,category,duration_minutes,regular_price,price_notes,price_required\)[\s\S]*?)`;/)[1].replace('${JSON.stringify(rows)}','$1');
 const rows=catalogue.IMAGE_SERVICE_NAMES.map(name=>({name,category:catalogue.imageServiceCategory(name),duration:catalogue.imageServiceDuration(name)}));
 await db.query(sql,[JSON.stringify(rows)]);await db.query(sql,[JSON.stringify(rows)]);
 assert.equal((await db.query('SELECT COUNT(*)::int AS count FROM venux_services')).rows[0].count,rows.length);
 const existing=(await db.query("SELECT regular_price,price_required FROM venux_services WHERE service_name='DMK 1'")).rows[0];
 assert.equal(Number(existing.regular_price),220);assert.equal(existing.price_required,false);
 assert.equal((await db.query("SELECT price_required FROM venux_services WHERE service_name='CGF'")).rows[0].price_required,true);
 await db.close();
});
test('same daily schedule supports both portals, all staff and off-grid booking times',()=>{
 const {default:Schedule}=load('app/admin/calendar/day-schedule.tsx');
 const rows=[{id:1,staff_id:7,staff_name:'Dannie',requested_time:'10:10 AM',duration_minutes:60,status:'confirmed',full_name:'Client A',treatment:'Facial'},{id:2,staff_id:8,staff_name:'Mei',requested_time:'2:15 PM',duration_minutes:30,status:'completed',full_name:'Client B',treatment:'DMK'}];
 for(const entry of ['admin','owner']){
  const html=renderToStaticMarkup(Schedule({rows,staff:[{id:7,full_name:'Dannie',active:true}],date:'2026-10-21',entry})).replaceAll('&amp;','&');
  assert.match(html,/Whole-day overview/);assert.match(html,/Mei appointments/);assert.match(html,/10:10 AM/);
  assert.ok(html.includes(entry==='owner'?'/owner?date=2026-10-21&appointment=1#city-appointment-1':'/admin/bookings?date=2026-10-21&appointment=1#appointment-1'));
  assert.ok(html.includes(entry==='owner'?'beautician=7':'staff=7'));
  assert.match(html,/time=10%3A15%20AM/);
 }
});
test('payroll details are separated by employee ID, even with the same display name',async()=>{
 const {default:Page}=load('app/admin/payroll/page.tsx',{
  'admin-auth':{isAdminAuthenticated:async()=>true,isOwnerAuthenticated:async()=>true},
  'next/navigation':{redirect:()=>{throw Error('Unexpected redirect')}},
  'admin-ui':{AdminShell:({children})=>jsx.jsx('main',{children})},
  'clinic-admin':{getPayrollReport:async()=>({summary:[{staff_id:1,full_name:'Therapist',hours:2,shifts:1,hourly_rate:32,wage:64},{staff_id:2,full_name:'Therapist',hours:3,shifts:1,hourly_rate:35,wage:105}],rows:[{id:10,staff_id:1,clock_in:'2026-10-21T00:00Z',clock_out:'2026-10-21T02:00Z',hours:2,wage:64,note:'Dannie private shift'},{id:11,staff_id:2,clock_in:'2026-10-21T00:00Z',clock_out:'2026-10-21T03:00Z',hours:3,wage:105,note:'Mei private shift'}]})}
 });
 const html=renderToStaticMarkup(await Page({searchParams:Promise.resolve({from:'2026-10-19',to:'2026-10-25'})}));
 const first=html.split('id="payroll-employee-1"')[1].split('</section>')[0];
 const second=html.split('id="payroll-employee-2"')[1].split('</section>')[0];
 assert.ok(first.includes('Dannie private shift'));assert.ok(!first.includes('Mei private shift'));
 assert.ok(second.includes('Mei private shift'));assert.ok(!second.includes('Dannie private shift'));
});
test('clinical history query retains more than fifty appointment comments',async()=>{
 const db=new PGlite();
 await db.exec(`CREATE TABLE venux_staff(id INT,full_name TEXT);CREATE TABLE venux_appointments(id INT,client_id INT,staff_id INT,requested_date DATE,start_minute INT,completion_comment TEXT);
 INSERT INTO venux_staff VALUES(1,'Dannie');
 INSERT INTO venux_appointments SELECT x,1,1,'2026-10-21',x,'Comment '||x FROM generate_series(1,60) AS x;
 INSERT INTO venux_appointments VALUES(61,2,1,'2026-10-21',61,'Other client');`);
 const sql=read('lib/clinic-admin.ts').match(/sql`(SELECT a\.\*,s\.full_name AS staff_name FROM venux_appointments a LEFT JOIN venux_staff s ON s.id=a.staff_id WHERE a.client_id=\$\{clientId\}[\s\S]*?)`/)[1].replace('${clientId}','$1');
 const records=(await db.query(sql,[1])).rows;
 assert.equal(records.length,60);assert.ok(records.some(record=>record.completion_comment==='Comment 1'));
 assert.ok(!records.some(record=>record.completion_comment==='Other client'));
 await db.close();
});
test('calendar appointment links open only that beautician appointment and its operation controls',async()=>{
 const rows=[{id:7,client_id:1,full_name:'Selected client',mobile:'0400000001',email:'',treatment:'Facial',staff_id:7,staff_name:'Dannie',requested_date:'2026-10-21',requested_time:'10:15 AM',status:'in_progress',customer_confirmation_status:'confirmed',total_amount:100,deposit_status:'paid',service_sms_consent:true},{id:8,client_id:2,full_name:'Other client hidden',mobile:'0400000002',treatment:'DMK',staff_id:8,staff_name:'Mei',requested_date:'2026-10-21',requested_time:'11:00 AM',status:'confirmed',total_amount:150,deposit_status:'paid'}];
 const {default:Page}=load('app/admin/bookings/page.tsx',{
  'booking-preferences':{BookingPreferencesProvider:({children})=>children,BookingSmsOptions:()=>null},
  '../calendar/day-schedule':{default:()=>jsx.jsx('p',{children:'Full table hidden in focused view'})},
  'node:crypto':{randomUUID:()=> 'test-key'},
  'admin-auth':{isAdminAuthenticated:async()=>true,getAdminRole:async()=> 'owner'},
  'clinic-admin':{getAppointments:async()=>rows,getStaff:async()=>[{id:7,full_name:'Dannie',active:true},{id:8,full_name:'Mei',active:true}],getOwnerServices:async()=>[],getClientForBooking:async()=>null},
  '../actions':{},'./appointment-client-picker':{AppointmentClientPicker:()=>null},'./treatment-picker':{TreatmentPicker:()=>null},
  'admin-ui':{AdminShell:({children})=>jsx.jsx('main',{children}),statusLabel:value=>String(value).replaceAll('_',' ')}
 });
 const html=renderToStaticMarkup(await Page({searchParams:Promise.resolve({date:'2026-10-21',appointment:'7'})}));
 assert.match(html,/Selected client/);assert.match(html,/End service/);assert.match(html,/Dannie/);
 assert.ok(!html.includes('Other client hidden'));assert.ok(!html.includes('Full table hidden in focused view'));assert.ok(!html.includes('Create appointment'));
});
