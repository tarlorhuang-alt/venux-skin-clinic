import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
const source=readFileSync(new URL('../app/api/enquiries/route.ts',import.meta.url),'utf8');
function endpoint(save){const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:id=>id==='next/server'?{NextResponse:{json:(body,{status=200}={})=>({body,status})}}:{saveWebsiteEnquiry:save}});return exports.POST;}
const valid={key:'c762e537-6396-4a37-b21e-6d78b6b6918c',email:'Client@Example.com',mobile:'0412 345 678',location:'Top Ryde',contactConsent:true};
test('homepage email and phone enquiry requires valid contact details and explicit enquiry permission',async()=>{
 let writes=0;const post=endpoint(async()=>writes++);
 for(const change of [{email:'bad'},{mobile:'abc'},{location:'Other'},{contactConsent:false},{key:'invalid'}]){const response=await post({json:async()=>({...valid,...change})});assert.equal(response.status,400);}
 assert.equal(writes,0);
});
test('homepage stores both steps together and normalises email without sending a message',async()=>{
 let saved;const post=endpoint(async input=>saved=input);const response=await post({json:async()=>valid});assert.equal(response.status,200);assert.equal(saved.email,'client@example.com');assert.equal(saved.mobile,valid.mobile);assert.equal(saved.location,'Top Ryde');
});
test('homepage does not claim success on failed storage; honeypot never stores a lead',async()=>{
 const post=endpoint(async()=>{throw Error('Database unavailable');});assert.equal((await post({json:async()=>valid})).status,500);
 assert.equal((await post({json:async()=>({...valid,website:'bot'})})).status,200);
});
