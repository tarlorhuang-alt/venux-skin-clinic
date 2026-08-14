import type {Metadata} from "next";
import {isAdminAuthenticated} from "../../../lib/admin-auth";
import {getDormantClients} from "../../../lib/clinic-admin";
import {queueReturnInviteAction} from "../actions";
import {AdminLogin,AdminShell,statusLabel} from "../admin-ui";
import "../admin.css";
import "../operations.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Client Retention | VenuX",robots:{index:false,follow:false}};

export default async function RetentionPage({searchParams}:{searchParams:Promise<{days?:string;q?:string;queued?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;const days=[90,120,180,365].includes(Number(params.days))?Number(params.days):120;const clients=await getDormantClients(days,params.q??"");
  return <AdminShell active="Client retention"><header className="clinic-admin-head"><div><p>Recall & rebooking</p><h1>Clients due to return</h1></div><span>{clients.length} clients with no completed visit in {days}+ days</span></header>
    {params.queued==="1"?<div className="clinic-alert">Return invitation added to the Messages queue.</div>:params.queued==="0"?<div className="clinic-alert error">This client has not provided marketing SMS consent, or this month’s invitation already exists.</div>:null}
    <form method="get" className="report-filter"><label>Inactive period<select name="days" defaultValue={String(days)}><option value="90">90 days</option><option value="120">120 days</option><option value="180">180 days</option><option value="365">1 year</option></select></label><label>Search<input name="q" defaultValue={params.q??""} placeholder="Name or mobile"/></label><button>Update list</button></form>
    <div className="retention-grid">{clients.map(client=><article className="ops-card" key={String(client.id)}><header><div><h2>{String(client.full_name)}</h2><span>{String(client.mobile)}</span></div><span className={`status-pill ${client.membership_status??"inactive"}`}>{statusLabel(client.membership_status??"non-member")}</span></header><p>{client.last_visit?`Last completed visit: ${new Date(String(client.last_visit)).toLocaleDateString("en-AU")}`:"No completed visit recorded"} · {Number(client.completed_visits)} completed services</p><div><a href={`/admin/clients/${client.id}`}>Full client record</a><a href={`/admin/bookings?client=${client.id}`}>Book appointment</a></div>{client.marketing_sms_consent&&!client.sms_unsubscribed_at?<form action={queueReturnInviteAction}><input type="hidden" name="clientId" value={String(client.id)}/><button>Queue return invitation</button></form>:<small>Marketing SMS consent not recorded — call the client instead.</small>}</article>)}</div>
  </AdminShell>;
}
