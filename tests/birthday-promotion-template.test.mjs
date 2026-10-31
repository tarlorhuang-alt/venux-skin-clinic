import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports={};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/birthday-promotion.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});
test('birthday draft uses the chosen offer verbatim, names the client, and includes opt-out',()=>{
 const body=exports.birthdayPromotion('  Amy Chen  ','10% off facials in your birthday month.');
 assert.match(body,/Happy birthday Amy!/);
 assert.match(body,/10% off facials in your birthday month\./);
 assert.match(body,/ISA Skin Clinic & Aesthetics/);
 assert.match(body,/Reply STOP to opt out\./);
 assert.throws(()=>exports.birthdayPromotion('Amy','  '));
 assert.throws(()=>exports.birthdayPromotion('Amy','x'.repeat(1000)));
});
