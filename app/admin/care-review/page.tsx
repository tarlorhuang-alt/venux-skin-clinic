import type {Metadata} from "next";
import {isAdminAuthenticated} from "../../../lib/admin-auth";
import {aftercareReviewDrafts} from "../../../lib/aftercare-review";
import {AdminLogin} from "../admin-ui";
import "../admin.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"After-care drafts · review only | ISA",robots:{index:false,follow:false}};
export default async function CareReview(){
 if(!(await isAdminAuthenticated()))return <AdminLogin/>;
 return <main style={{maxWidth:920,margin:'24px auto',padding:'0 20px 48px',font:'16px/1.8 Arial,sans-serif',color:'#173d39'}}>
  <p>ISA SKIN CLINIC & AESTHETICS · 27 October 2026</p><h1>After-care 待审核草稿</h1>
  <div className="clinic-alert"><strong>仅供审核，尚未用于客人的二维码、短信或护理页面。</strong><p>请由负责治疗的合资格医师确认产品、设备、恢复时限和应急流程，再批准对客使用。以下不替代个人化医疗建议。</p></div>
  <p>待填写：诊所日间电话、治疗医师姓名、非营业时间紧急联系方式、各项目复诊安排。严重急症请拨澳洲 000。</p>
  <nav style={{display:'flex',flexWrap:'wrap',gap:16}}>{aftercareReviewDrafts.map(guide=><a key={guide.id} href={`#${guide.id}`}>{guide.title}</a>)}</nav>
  {aftercareReviewDrafts.map(guide=><article id={guide.id} key={guide.id} style={{border:'1px solid #dbe4df',borderRadius:12,padding:24,marginTop:24,scrollMarginTop:16}}><p><strong>草稿 · 待医师审核</strong></p><h2>{guide.title}</h2><p>{guide.scope}</p>{guide.sections.map(section=><section key={section.title}><h3>{section.title}</h3><ul>{section.items.map(item=><li key={item} style={{marginBottom:12}}>{item}</li>)}</ul></section>)}<aside style={{padding:16,background:'#fff6e7'}}><h3>发布前请确认</h3><ul>{guide.checks.map(item=><li key={item}>{item}</li>)}</ul></aside></article>)}
  <p><a href="/admin/bookings">← Appointments</a> · <a href="/admin/receipts">Receipts</a></p>
 </main>;
}
