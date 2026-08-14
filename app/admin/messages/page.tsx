import type { Metadata } from "next";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import { getSmsOutbox } from "../../../lib/clinic-admin";
import { markSmsSentAction,queueBirthdaysAction } from "../actions";
import { AdminLogin,AdminShell,statusLabel } from "../admin-ui";
import "../admin.css";
import "./messages.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Messages | VenuX Clinic OS",robots:{index:false,follow:false}};
export default async function MessagesPage({searchParams}:{searchParams:Promise<{saved?:string;birthdays?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;const rows=await getSmsOutbox(),queued=rows.filter(row=>String(row.status)==="queued");
  return <AdminShell active="Messages"><header className="clinic-admin-head"><div><p>Consent-aware communication</p><h1>SMS outbox</h1></div><span>{queued.length} awaiting send</span></header>
    <div className="message-toolbar"><div><strong>Safe message queue</strong><span>Messages are generated here but are not sent to an external provider yet.</span></div><form action={queueBirthdaysAction}><button>Check today’s birthdays</button></form></div>
    {params.birthdays!==undefined?<div className="clinic-alert">Birthday check complete: {params.birthdays} new message{params.birthdays==="1"?"":"s"} queued.</div>:null}{params.saved?<div className="clinic-alert">Message marked as sent.</div>:null}
    <section className="message-grid">{rows.length?rows.map(row=><article key={String(row.id)}><header><div><strong>{String(row.full_name??"Client")}</strong><a href={`sms:${row.recipient}`}>{String(row.recipient)}</a></div><span className={`status-pill ${row.status}`}>{statusLabel(row.status)}</span></header><small>{statusLabel(row.message_type)} · {new Date(String(row.queued_at)).toLocaleString("en-AU")}</small><textarea readOnly value={String(row.message_body)} aria-label={`Message for ${row.full_name}`}/>{String(row.status)==="queued"?<form action={markSmsSentAction}><input type="hidden" name="id" value={String(row.id)}/><button>Mark as sent</button></form>:null}</article>):<div className="empty-admin">Confirmation and birthday messages will appear here automatically.</div>}</section>
  </AdminShell>;
}
