import type {Metadata} from "next";
import {getAdminRole,isAdminAuthenticated} from "../../../lib/admin-auth";
import {getOwnerServices,getPackageAdminData} from "../../../lib/clinic-admin";
import {AdminLogin,AdminShell} from "../admin-ui";
import {assignPackageAction,createPackageAction,usePackageSessionAction} from "../actions";
import {AppointmentClientPicker} from "../bookings/appointment-client-picker";
import "../admin.css";
import "../operations.css";
import "../bookings/bookings.css";
import "../bookings/bookings-updates.css";
import "./packages.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Packages | VenuX Clinic OS",robots:{index:false,follow:false}};
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

export default async function PackagesPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;const role=await getAdminRole();
  const [{packages,items,assignments},services]=await Promise.all([getPackageAdminData(),getOwnerServices()]);const activeServices=services.filter(row=>row.active);
  const grouped=new Map<number,typeof assignments>();for(const row of assignments){const id=Number(row.id);grouped.set(id,[...(grouped.get(id)??[]),row]);}
  return <AdminShell active="Packages"><header className="clinic-admin-head"><div><p>Treatment plans & sessions</p><h1>Client packages</h1></div><span>Sessions deduct when appointments are completed</span></header>
    {params.created?<div className="clinic-alert">Package template saved.</div>:null}{params.assigned?<div className="clinic-alert">Package added to the client.</div>:null}{params.used?<div className="clinic-alert">One session deducted.</div>:null}{params.error?<div className="clinic-alert error">The package could not be saved. Check the client, treatments and remaining sessions.</div>:null}
    <section className="package-top">
      {role==="owner"?<form action={createPackageAction} className="ops-card package-form"><h2>Create or update a package</h2><label>Package name<input name="name" required placeholder="e.g. Acne recovery course"/></label><div className="package-form-row"><label>Package price (AUD)<input name="price" type="number" min="0" step="0.01" required/></label><label>Valid for days<input name="validityDays" type="number" min="1" defaultValue="365" required/></label></div><p>Select up to four treatments and the included sessions.</p>{[1,2,3,4].map(index=><div className="package-item-input" key={index}><select name={`serviceId${index}`} defaultValue=""><option value="">Treatment {index}</option>{activeServices.map(service=><option value={String(service.id)} key={String(service.id)}>{String(service.category)} · {String(service.service_name)}</option>)}</select><input name={`sessions${index}`} type="number" min="1" placeholder="Sessions"/></div>)}<button>Save package</button></form>:<article className="ops-card package-form"><h2>Package templates</h2><p>Package templates are managed by the owner. Staff can assign an existing package to a client below.</p></article>}
      <form action={assignPackageAction} className="ops-card package-form"><h2>Add package to a client</h2><AppointmentClientPicker/><label>Package<select name="packageId" required defaultValue=""><option value="" disabled>Select package</option>{packages.map(row=><option value={String(row.id)} key={String(row.id)}>{String(row.package_name)} · ${Number(row.package_price).toLocaleString("en-AU")}</option>)}</select></label><div className="package-form-row"><label>Amount paid<input name="amountPaid" type="number" min="0" step="0.01" required/></label><label>Purchased on<input name="purchasedOn" type="date" defaultValue={today()} required/></label></div><label>Custom expiry (optional)<input name="expiresOn" type="date"/></label><button>Add client package</button></form>
    </section>
    <section className="ops-card package-catalog"><header><h2>Available packages</h2><span>{packages.length} active</span></header><div>{packages.map(row=><article key={String(row.id)}><small>{Number(row.validity_days)} days</small><h3>{String(row.package_name)}</h3><strong>${Number(row.package_price).toLocaleString("en-AU")}</strong><ul>{items.filter(item=>Number(item.package_id)===Number(row.id)).map(item=><li key={String(item.id)}>{String(item.service_name)} <b>× {Number(item.included_sessions)}</b></li>)}</ul></article>)}</div></section>
    <section className="ops-card package-client-list"><header><h2>Client packages</h2><span>{grouped.size} assigned</span></header>{[...grouped.values()].map(rows=>{const first=rows[0];return <article key={String(first.id)}><div className="package-client-head"><span><a href={`/admin/clients/${String(first.client_id)}`}>{String(first.full_name)}</a><small>{String(first.mobile)} · {String(first.package_name)}</small></span><span><strong>${Number(first.amount_paid).toLocaleString("en-AU")}</strong><small>{String(first.status)} · expires {first.expires_on?new Date(String(first.expires_on)).toLocaleDateString("en-AU"):"never"}</small></span></div>{rows.map(row=>{const remaining=Number(row.included_sessions)-Number(row.used_sessions);return <div className="package-session" key={String(row.item_id)}><span><strong>{String(row.service_name)}</strong><small>{Number(row.used_sessions)} used · {remaining} remaining</small></span><form action={usePackageSessionAction}><input type="hidden" name="clientId" value={String(row.client_id)}/><input type="hidden" name="itemId" value={String(row.item_id)}/><button disabled={remaining<=0}>Use 1 session</button></form></div>})}</article>})}</section>
  </AdminShell>;
}
