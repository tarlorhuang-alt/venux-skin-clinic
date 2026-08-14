import type { Metadata } from "next";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import { getClients } from "../../../lib/clinic-admin";
import { changeMembership, importClients } from "../actions";
import { AdminLogin,AdminShell,statusLabel } from "../admin-ui";
import "../admin.css";
import "./import.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Clients & Membership | VenuX Clinic OS",robots:{index:false,follow:false}};

export default async function ClientsAdmin({searchParams}:{searchParams:Promise<{saved?:string;error?:string;imported?:string;processed?:string;duplicates?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const clients=await getClients();
  return <AdminShell active="Clients & membership">
    <header className="clinic-admin-head"><div><p>Profiles & prepaid cards</p><h1>Clients & membership</h1></div><span>{clients.length} clients</span></header>
    {params.saved&&<div className="clinic-alert">Membership card updated.</div>}
    {params.imported!==undefined&&<div className="clinic-alert">Import complete: {params.processed} valid records processed, {params.imported} new clients added{Number(params.duplicates)>0?`, ${params.duplicates} exact duplicates combined`:""}.</div>}
    {params.error&&<div className="clinic-alert error">{params.error==="columns"?"The file needs Name and Mobile columns.":"Please check the customer import file or membership values."}</div>}
    <form action={importClients} className="client-import-form"><div><strong>Import customer records</strong><span>CSV columns: Group, Name, DOB, Mobile, Email, Address. Existing clients are matched by Email or by Name + Mobile.</span></div><input type="file" name="clientsFile" accept=".csv,text/csv" required/><button type="submit">Import CSV</button></form>
    <section className="client-grid">{clients.length?clients.map(client=><article className="client-card" key={String(client.id)}><header><div><h2>{String(client.full_name)}</h2><span>Card VX{String(client.id).padStart(6,"0")} · {String(client.customer_group??"General")}</span></div><span className={`status-pill ${client.membership_status??"inactive"}`}>{statusLabel(client.membership_status??"non-member")}</span></header><div className="client-contact"><a href={`tel:${client.mobile}`}>{String(client.mobile)}</a><a href={`mailto:${client.email}`}>{client.email?String(client.email):"No email"}</a>{client.dob&&<span>DOB: {new Date(String(client.dob)).toLocaleDateString("en-AU")}</span>}{client.address&&<span>{String(client.address)}</span>}</div><div className="client-meta"><span>{Number(client.visit_count)} appointments</span><span>{client.last_visit?`Last: ${new Date(String(client.last_visit)).toLocaleDateString("en-AU")}`:"No visits"}</span></div><form action={changeMembership} className="membership-form"><input type="hidden" name="clientId" value={String(client.id)}/><label><span>Card balance</span><input name="balance" type="number" min="0" step="1" defaultValue={Number(client.balance??0)}/></label><label><span>Membership</span><select name="status" defaultValue={String(client.membership_status??"inactive")}><option value="inactive">Inactive</option><option value="active">Active</option><option value="paused">Paused</option></select></label><button type="submit">Save membership card</button></form></article>):<div className="empty-admin">No clients yet. A profile is created when a customer submits an online booking request.</div>}</section>
  </AdminShell>;
}
