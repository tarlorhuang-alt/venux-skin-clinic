import type { Metadata } from "next";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import { getSmsOutbox,isClickSendConfigured } from "../../../lib/clinic-admin";
import { queueBirthdaysAction,sendSmsNowAction } from "../actions";
import { AdminLogin,AdminShell,statusLabel } from "../admin-ui";
import "../admin.css";
import "./messages.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Messages | ISA Clinic OS",robots:{index:false,follow:false}};
export default async function MessagesPage({searchParams}:{searchParams:Promise<{sent?:string;birthdays?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;const rows=await getSmsOutbox(),queued=rows.filter(row=>["queued","failed"].includes(String(row.status))),connected=isClickSendConfigured();
  return <AdminShell active="Messages"><header className="clinic-admin-head"><div><p>Consent-aware communication</p><h1>SMS outbox</h1></div><span>{queued.length} awaiting send</span></header>
    <div className="message-toolbar"><div><strong>{connected?"ClickSend connected":"ClickSend setup required"}</strong><span>{connected?"Tomorrow’s appointment confirmations send automatically. Birthday promotions are prepared for review and sending.":"Add CLICKSEND_USERNAME and CLICKSEND_API_KEY in Vercel, then redeploy."}</span></div><form action={queueBirthdaysAction}><button>Check today’s birthdays</button></form></div>
    {params.birthdays!==undefined?<div className="clinic-alert">Birthday check complete: {params.birthdays} new birthday promotion{params.birthdays==="1"?"":"s"} prepared for review.</div>:null}{params.sent?<div className="clinic-alert">SMS accepted by ClickSend.</div>:null}{params.error==="send"?<div className="clinic-alert error">SMS could not be sent. Check the message error and ClickSend account balance.</div>:null}
    <section className="message-grid">{rows.length?rows.map(row=><article key={String(row.id)}><header><div><strong>{String(row.full_name??"Client")}</strong><a href={`sms:${row.recipient}`}>{String(row.recipient)}</a></div><span className={`status-pill ${row.status}`}>{statusLabel(row.status)}</span></header><small>{statusLabel(row.message_type)} · {new Date(String(row.queued_at)).toLocaleString("en-AU")}{Number(row.attempt_count)>0?` · ${Number(row.attempt_count)} attempt${Number(row.attempt_count)===1?"":"s"}`:""}</small><textarea name={row.message_type==="birthday"?"messageBody":undefined} form={`send-sms-${row.id}`} readOnly={row.message_type!=="birthday"||!["queued","failed"].includes(String(row.status))} defaultValue={String(row.message_body)} maxLength={1000} aria-label={`Message for ${row.full_name}`}/>{row.message_type==="birthday"&&row.status==="queued"?<small>Birthday promotion: edit the offer above, then send. No SMS has been sent yet.</small>:null}{row.last_error?<p className="message-error">{String(row.last_error)}</p>:null}{["queued","failed"].includes(String(row.status))?<form action={sendSmsNowAction} id={`send-sms-${row.id}`}><input type="hidden" name="id" value={String(row.id)}/><button>{String(row.status)==="failed"?"Retry SMS":"Send now"}</button></form>:null}</article>):<div className="empty-admin">Confirmation and birthday messages will appear here automatically.</div>}</section>
  </AdminShell>;
}
