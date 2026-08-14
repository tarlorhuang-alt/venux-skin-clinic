import type { Metadata } from "next";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import { getFollowups } from "../../../lib/clinic-admin";
import { AdminLogin,AdminShell,statusLabel } from "../admin-ui";
import "../admin.css";
import "./followups.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Follow-ups | VenuX Clinic OS",robots:{index:false,follow:false}};

export default async function FollowupsPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const rows=await getFollowups(),pending=rows.filter(row=>String(row.status)==="pending");
  return <AdminShell active="Follow-ups"><header className="clinic-admin-head"><div><p>Recovery & safety</p><h1>Follow-up queue</h1></div><span>{pending.length} pending</span></header><div className="followup-table"><div className="followup-table-head"><span>Due</span><span>Client</span><span>Treatment</span><span>Follow-up</span><span>Status</span></div>{rows.length?rows.map(row=><a href={`/admin/clients/${row.client_id}#followups`} className={String(row.status)==="pending"&&new Date(String(row.due_date))<new Date()?"overdue":""} key={String(row.id)}><time>{new Date(String(row.due_date)).toLocaleDateString("en-AU")}</time><span><strong>{String(row.full_name)}</strong><small>{String(row.mobile)}</small></span><span>{String(row.service??"Clinical review")}</span><span>{String(row.followup_type)}</span><span className={`status-pill ${String(row.status)}`}>{statusLabel(row.status)}</span></a>):<div className="empty-admin">Follow-up tasks are created automatically from supported treatment records.</div>}</div></AdminShell>;
}
