import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function load(path,mocks={}){const exports={};vm.runInNewContext(ts.transpileModule(read(path),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Promise,Set,require:id=>{if(id.endsWith('.css'))return {};if(id==='react/jsx-runtime')return jsx;if(id==='next/link')return {default:({href,children})=>jsx.jsx('a',{href,children})};if(id.includes('published-aftercare'))return load('lib/published-aftercare.ts');for(const [match,value]of Object.entries(mocks))if(id.includes(match))return value;throw Error(id)}});return exports;}
const {careSlug,careSlugs}=load('lib/care-guides.ts');
const {publishedAftercare}=load('lib/published-aftercare.ts');
test('approved phased guides map to their procedures without conflating mechanical needling, Venus Viva or unrelated lasers',()=>{
 for(const [name,slug] of [['Pigmentation Laser Treatment','laser'],['10* laser PIH','laser'],['Laser Toning F/face','laser'],['祛斑激光','laser'],['Morpheus8','rf-microneedling'],['黄金微针','rf-microneedling'],['RF Microneedling','rf-microneedling'],['ViVa NanoFractional RF','fractional-rf'],['Venus Viva','fractional-rf'],['Microneedling Treatment','microneedling'],['Skin Booster','skin-booster'],['水光注射','skin-booster'],['Anti-Wrinkle Injections','botox'],['Botox','botox'],['Dermal Filler','filler'],['玻尿酸填充','filler'],['CO2 Laser Full Face','general'],['Laser Hair Removal','general'],['Tattoo Removal laser','general'],['IPL','ipl']])assert.equal(careSlug(name),slug,name);
 assert.deepEqual(Array.from(careSlugs('Pigmentation Laser + RF Microneedling + Skin Booster + Botox + Dermal Filler')),['laser','rf-microneedling','skin-booster','botox','filler']);
 assert.deepEqual(Array.from(careSlugs('3* Skin Booster (135HA + 532)')),['skin-booster']);
});
test('published patient pages contain approved recovery phases, common care and procedure-specific emergencies',()=>{
 const {default:Content}=load('app/care/aftercare-content.tsx');
 for(const key of ['laser','rf-microneedling','skin-booster','botox','filler']){
  const html=renderToStaticMarkup(Content({guide:publishedAftercare[key]}));
  assert.ok(html.includes(publishedAftercare[key].english));for(const phase of publishedAftercare[key].phases)assert.ok(html.includes(phase.time));
  assert.match(html,/所有治疗通用注意事项/);assert.match(html,/异常症状与紧急求助/);assert.match(html,/不替代治疗医生/);
 }
 const filler=renderToStaticMarkup(Content({guide:publishedAftercare.filler}));assert.match(filler,/000/);assert.match(filler,/视力模糊/);
 const embedded=renderToStaticMarkup(Content({guide:publishedAftercare.botox,showUniversal:false}));assert.ok(!embedded.includes('所有治疗通用注意事项'));
});
test('care-only appointment QR renders all booked/add-on procedures, with common guidance once',async()=>{
 const {default:Page}=load('app/booking/aftercare/[token]/page.tsx',{
  'clinic-admin':{getAftercareByToken:async()=>({treatment:'Pigmentation Laser + Skin Booster + Botox',completed_at:'2026-10-28'})},
  'care-guides':{careSlugs},'next/navigation':{notFound:()=>{throw Error('Unexpected 404')}},
  'care/treatment-guide':{default:({params,showUniversal})=>jsx.jsx('div',{className:showUniversal?'common-guidance':'treatment-guidance'})}
 });
 const html=renderToStaticMarkup(await Page({params:Promise.resolve({token:'a'.repeat(32)})}));
 assert.equal((html.match(/class="common-guidance"/g)||[]).length,1);assert.equal((html.match(/class="treatment-guidance"/g)||[]).length,2);
});
