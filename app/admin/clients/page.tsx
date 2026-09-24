import type { Metadata } from "next";
import { getAdminRole,isAdminAuthenticated } from "../../../lib/admin-auth";
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

function pageHref(page:number,search:string,location:string){
  const query=new URLSearchParams();if(search)query.set("q",search);if(location)query.set("location",location);if(page>1)query.set("page",String(page));
  const suffix=query.toString();return `/admin/clients${suffix?`?${suffix}`:""}`;
}

async function loadClientPage(search:string,location:string,page:number){
  try{return await Promise.all([getClients(search,location,page,50),getClientLocationStats()]);}
  catch(error){console.error("[admin/clients] Unable to load client list",error);throw error;}
}

export default async function ClientsAdmin({searchParams}:{searchParams:Promise<{saved?:string;error?:string;imported?:string;processed?:string;duplicates?:string;q?:string;location?:string;page?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const role=await getAdminRole(),search=(params.q??"").trim(),location=role==="staff"?"Top Ryde":["City","Top Ryde"].includes(params.location??"")?String(params.location):"";
  const requestedPage=Number(params.page??"1"),page=Number.isInteger(requestedPage)&&requestedPage>0?requestedPage:1;
  const [clients,locationStats]=await loadClientPage(search,location,page);
  const total=Number(clients[0]?.filtered_count??0),totalPages=Math.max(1,Math.ceil(total/50));
  return <AdminShell active="Clients">
    <header className="clinic-admin-head"><div><p>Profiles & prepaid cards</p><h1>Clients & membership</h1></div><div className="record-actions"><a href="/admin/clients/new">+ New client</a><span>{total} matching clients · page {page} of {totalPages}</span></div></header>
    {params.saved?<div className="clinic-alert">Membership card updated.</div>:null}
    {params.imported!==undefined?<div className="clinic-alert">Import complete: {params.processed} valid records processed, {params.imported} new clients added{Number(params.duplicates)>0?`, ${params.duplicates} exact duplicates combined`:""}.</div>:null}
    {params.error?<div className="clinic-alert error">{params.error==="columns"?"The file needs Name and Mobile columns.":"Please check the customer import file or membership values."}</div>:null}
    {role==="owner"?<nav className="location-summary"><a className={!location?"active":""} href="/admin/clients">All clients</a>{locationStats.map(row=><a className={location===String(row.clinic_location)?"active":""} href={`/admin/clients?location=${encodeURIComponent(String(row.clinic_location))}`} key={String(row.clinic_location)}><span className={`clinic-location-badge ${String(row.clinic_location)==="City"?"city":"ryde"}`}>{String(row.clinic_location)}</span><b>{Number(row.clients)}</b></a>)}</nav>:null}
    <form method="get" className="client-search-form">{location?<input type="hidden" name="location" value={location}/>:null}<label>Search all client information<input name="q" defaultValue={search} placeholder="Mobile, name or email"/></label><button>Search</button>{search||location?<a href="/admin/clients">Clear</a>:null}</form>
    {role==="owner"?<form action={importClients} className="client-import-form"><div><strong>Import or export customer records</strong><span>Choose City or Top Ryde before importing. CSV columns: Group, Name, DOB, Mobile, Email, Address.</span><a className="client-export-link" href="/admin/clients/export">Export all clients CSV</a></div><label>Client location<select name="clinicLocation" required defaultValue=""><option value="" disabled>Select location</option><option>Top Ryde</option><option>City</option></select></label><input type="file" name="clientsFile" accept=".csv,text/csv" required/><button type="submit">Import CSV</button></form>:null}
    <section className="client-grid">{clients.length?clients.map(client=><article className="client-card" key={String(client.id)}>
      <header><div><h2>{String(client.full_name)} <span className={`clinic-location-badge ${String(client.clinic_location)==="City"?"city":"ryde"}`}>{String(client.clinic_location??"Top Ryde")}</span></h2><span>Card VX{String(client.id).padStart(6,"0")} · {String(client.customer_group??"General")}</span></div>{client.is_premium?<span className="premium-client-badge">✦ Premium</span>:null}</header>
      <div className="client-contact"><a href={`tel:${client.mobile}`}>{String(client.mobile)}</a><a href={`mailto:${client.email}`}>{client.email?String(client.email):"No email"}</a>{client.dob?<span>DOB: {new Date(String(client.dob)).toLocaleDateString("en-AU")}</span>:null}{client.address?<span>{String(client.address)}</span>:null}</div>
      <div className="client-meta"><span>{Number(client.visit_count)} appointments</span><span>{client.last_visit?`Last: ${new Date(String(client.last_visit)).toLocaleDateString("en-AU")}`:"No visits"}</span></div>
      <a className="clinical-record-link" href={`/admin/clients/${client.id}`}>Open clinical record →</a>
      <MembershipBalanceForm action={changeMembership} clientId={Number(client.id)} balance={Number(client.balance??0)} existing={client.membership_status!=null} className="membership-form" compactLabels/>
    </article>):<div className="empty-admin">No matching clients. Search by another name, mobile number or email.</div>}</section>
    {totalPages>1?<nav className="client-pagination" aria-label="Client result pages">
      {page>1?<a href={pageHref(page-1,search,location)}>← Previous</a>:<span/>}
      <strong>Page {page} of {totalPages}</strong>
      {page<totalPages?<a href={pageHref(page+1,search,location)}>Next →</a>:<span/>}
    </nav>:null}
  </AdminShell>;
}
