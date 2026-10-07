import type { Metadata } from "next";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import {getFollowups} from "../../../lib/clinic-admin";
import {completeFollowupAction} from "../actions";
import { AdminLogin,AdminShell } from "../admin-ui";
import "../admin.css";
import "../operations.css";
import "./followups.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Follow-ups | VenuX Clinic OS",robots:{index:false,follow:false}};

export default async function FollowupsPage({searchParams}:{searchParams:Promise<{error?:string;saved?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const rows=await getFollowups();
  return <AdminShell active="Follow-ups"><header className="clinic-admin-head"><div><p>Automatic seven-day care</p><h1>Follow-up reminders</h1></div><span>{rows.length} pending</span></header>
    {params.saved?<div className="clinic-alert">Follow-up completed and saved to the client history.</div>:null}
    <section className="followup-table"><div className="followup-table-head"><span>Due</span><span>Client</span><span>Treatment</span><span>Completion comment</span><span>Action</span></div>{rows.length?rows.map(row=><article className={Number(row.days_until_due)<0?"overdue":""} key={String(row.id)}><strong>{new Date(`${String(row.due_date).slice(0,10)}T00:00:00Z`).toLocaleDateString("en-AU",{day:"2-digit",month:"short",timeZone:"UTC"})}<small>{Number(row.days_until_due)<0?`${Math.abs(Number(row.days_until_due))} days overdue`:Number(row.days_until_due)===0?"Due today":`In ${Number(row.days_until_due)} days`}</small></strong><span><a href={`/admin/clients/${row.client_id}`}>{String(row.full_name)}</a><small>{String(row.mobile)}</small></span><span>{String(row.treatment||"Treatment")}<small>{String(row.staff_name||"Staff not recorded")}</small></span><span>{String(row.completion_comment||"No completion comment")}</span><form action={completeFollowupAction}><input type="hidden" name="id" value={String(row.id)}/><input name="notes" placeholder="Recovery / client response" aria-label={`Follow-up note for ${row.full_name}`}/><button>Complete</button></form></article>):<div className="empty-admin">No pending follow-ups. Completing a service automatically creates a reminder due in seven days.</div>}</section>
  </AdminShell>;
}
