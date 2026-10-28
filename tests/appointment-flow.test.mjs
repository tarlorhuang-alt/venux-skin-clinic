import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
async function load(path){
 const source=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
const {reminderEventKey,reminderMessage}=await load('../lib/appointment-communication.ts');
const {careSlug,carePath}=await load('../lib/care-guides.ts');
test('schedule-specific key deduplicates retries and permits rescheduled confirmation',()=>{
 assert.equal(reminderEventKey(99,'2026-10-13','10:00 AM'),reminderEventKey(99,'2026-10-13','10:00 AM'));
 assert.notEqual(reminderEventKey(99,'2026-10-13','10:00 AM'),reminderEventKey(99,'2026-10-13','11:00 AM'));
 assert.notEqual(reminderEventKey(99,'2026-10-13','10:00 AM'),reminderEventKey(100,'2026-10-13','10:00 AM'));
});
test('confirmation SMS carries one appointment link and all preparation steps',()=>{
 const message=reminderMessage('  Jane Doe ','Facial treatments','2026-10-13','10:00 AM','test-token','https://clinic.example/');
 assert.match(message,/Hi Jane,/);
 assert.match(message,/13 Oct 2026 at 10:00 AM/);
 assert.match(message,/confirm, review pre-care and complete your skin questionnaire/);
 assert.match(message,/https:\/\/clinic.example\/booking\/confirm\/test-token$/);
 assert.equal((message.match(/https:\/\//g)||[]).length,1);
});
test('care mapping covers known treatments and offers clinician-directed fallback',()=>{
 for(const [name,slug] of [['Facial treatments','facial'],['IPL','ipl'],['DMK enzyme','dmk'],['Ultherapy','hifu'],['RF Microneedling','rf-microneedling'],['PRP','prp'],['Rejuran','skin-booster'],['Unknown service','general']]){
  assert.equal(careSlug(name),slug);
  assert.equal(carePath(name,'pre'),`/care/${slug}/pre`);
  assert.equal(carePath(name,'after'),`/care/${slug}/after`);
 }
});
