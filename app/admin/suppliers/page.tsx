import type {Metadata} from "next";
import {isAdminAuthenticated} from "../../../lib/admin-auth";
import {getSuppliers} from "../../../lib/clinic-admin";
import {addSupplierAction} from "../actions";
import {AdminLogin,AdminShell} from "../admin-ui";
import "../admin.css";
import "../operations.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Suppliers | VenuX",robots:{index:false,follow:false}};

export default async function SuppliersPage({searchParams}:{searchParams:Promise<{created?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;const suppliers=await getSuppliers();
  return <AdminShell active="Suppliers"><header className="clinic-admin-head"><div><p>Purchasing contacts</p><h1>Suppliers</h1></div><span>{suppliers.length} supplier records</span></header>{params.created?<div className="clinic-alert">Supplier saved.</div>:null}
    <details className="ops-card supplier-create" open><summary>+ Add supplier or brand representative</summary><form action={addSupplierAction} className="ops-form-grid"><label>Supplier name<input name="name" required/></label><label>Contact person<input name="contact"/></label><label>Phone<input name="phone" inputMode="tel"/></label><label>Email<input name="email" type="email"/></label><label>Website / ordering portal<input name="website" type="url" placeholder="https://"/></label><label>Brands supplied<input name="brands" placeholder="DMK, Sothys, consumables…"/></label><label>Account reference<input name="accountReference"/></label><label>Notes<textarea name="notes"/></label><button>Save supplier</button></form></details>
    <section className="supplier-grid">{suppliers.map(row=><article className="ops-card" key={String(row.id)}><small>Supplier</small><h2>{String(row.supplier_name)}</h2><p>{String(row.brands||"No brands listed")}</p><dl><dt>Contact</dt><dd>{String(row.contact_name||"—")}</dd><dt>Phone</dt><dd>{row.phone?<a href={`tel:${row.phone}`}>{String(row.phone)}</a>:"—"}</dd><dt>Email</dt><dd>{row.email?<a href={`mailto:${row.email}`}>{String(row.email)}</a>:"—"}</dd><dt>Account</dt><dd>{String(row.account_reference||"—")}</dd></dl>{row.website?<a className="supplier-link" href={String(row.website)} target="_blank" rel="noreferrer">Open supplier portal ↗</a>:null}{row.notes?<p>{String(row.notes)}</p>:null}</article>)}</section>
  </AdminShell>;
}
