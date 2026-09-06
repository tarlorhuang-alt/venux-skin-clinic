import type { Metadata } from "next";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import { getClientLocationStats,getClients } from "../../../lib/clinic-admin";
import { changeMembership, importClients } from "../actions";
import { MembershipBalanceForm } from "./membership-balance-form";
import { AdminLogin,AdminShell } from "../admin-ui";
import "../admin.css";
import "./import.css";
import "./clinical-list.css";
import "./export.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Clients & Membership | VenuX Clinic OS",robots:{index:false,follow:false}};

export default async function ClientsAdmin({searchParams}:{searchParams:Promise<{saved?:string;error?:string;imported?:string;processed?:string;duplicates?:string;q?:string;location?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const location=["City","Top Ryde"].includes(params.location??"")?String(params.location):"";
  const [clients,locationStats]=await Promise.all([getClients(params.q??"",location),getClientLocationStats()]);
  return <AdminShell active="Clients & membership">
    <header className="clinic-admin-head"><div><p>Profiles & prepaid cards</p><h1>Clients & membership</h1></div><span>{clients.length} clients shown</span></header>
    {params.saved?<div className="clinic-alert">Membership card updated.</div>:null}
    {params.imported!==undefined?<div className="clinic-alert">Import complete: {params.processed} valid records processed, {params.imported} new clients added{Number(params.duplicates)>0?`, ${params.duplicates} exact duplicates combined`:""}.</div>:null}
    {params.error?<div className="clinic-alert error">{params.error==="columns"?"The file needs Name and Mobile columns.":"Please check the customer import file or membership values."}</div>:null}
    <nav className="location-summary"><a className={!location?"active":""} href="/admin/clients">All clients</a>{locationStats.map(row=><a className={location===String(row.clinic_location)?"active":""} href={`/admin/clients?location=${encodeURIComponent(String(row.clinic_location))}`} key={String(row.clinic_location)}><span className={`clinic-location-badge ${String(row.clinic_location)==="City"?"city":"ryde"}`}>{String(row.clinic_location)}</span><b>{Number(row.clients)}</b></a>)}</nav>
    <form method="get" className="client-search-form">{location?<input type="hidden" name="location" value={location}/>:null}<label>Search all client information<input name="q" defaultValue={params.q??""} placeholder="Mobile, name or email"/></label><button>Search</button>{params.q||location?<a href="/admin/clients">Clear</a>:null}</form>
    <form action={importClients} className="client-import-form"><div><strong>Import or export customer records</strong><span>Choose City or Top Ryde before importing. CSV columns: Group, Name, DOB, Mobile, Email, Address.</span><a className="client-export-link" href="/admin/clients/export">Export all clients CSV</a></div><label>Client location<select name="clinicLocation" required defaultValue=""><option value="" disabled>Select location</option><option>Top Ryde</option><option>City</option></select></label><input type="file" name="clientsFile" accept=".csv,text/csv" required/><button type="submit">Import CSV</button></form>
    <section className="client-grid">{clients.length?clients.map(client=><article className="client-card" key={String(client.id)}>
      <header><div><h2>{String(client.full_name)} <span className={`clinic-location-badge ${String(client.clinic_location)==="City"?"city":"ryde"}`}>{String(client.clinic_location??"Top Ryde")}</span></h2><span>Card VX{String(client.id).padStart(6,"0")} · {String(client.customer_group??"General")}</span></div>{client.is_premium?<span className="premium-client-badge">✦ Premium</span>:null}</header>
      <div className="client-contact"><a href={`tel:${client.mobile}`}>{String(client.mobile)}</a><a href={`mailto:${client.email}`}>{client.email?String(client.email):"No email"}</a>{client.dob?<span>DOB: {new Date(String(client.dob)).toLocaleDateString("en-AU")}</span>:null}{client.address?<span>{String(client.address)}</span>:null}</div>
      <div className="client-meta"><span>{Number(client.visit_count)} appointments</span><span>{client.last_visit?`Last: ${new Date(String(client.last_visit)).toLocaleDateString("en-AU")}`:"No visits"}</span></div>
      <a className="clinical-record-link" href={`/admin/clients/${client.id}`}>Open clinical record →</a>
      <MembershipBalanceForm action={changeMembership} clientId={Number(client.id)} balance={Number(client.balance??0)} existing={client.membership_status!=null} className="membership-form" compactLabels/>
    </article>):<div className="empty-admin">No clients yet. A profile is created when a customer submits an online booking request.</div>}</section>
  </AdminShell>;
}
