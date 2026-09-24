import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getAdminRole} from "../../lib/admin-auth";
import {staffLogin} from "./actions";
import "../admin/admin.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Staff Login | VenuX Clinic OS",robots:{index:false,follow:false}};

export default async function StaffLoginPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;
  if(await getAdminRole())redirect("/admin/bookings");
  return <main className="clinic-admin-login"><section><div className="clinic-admin-brand">✦ VenuX</div><p>Top Ryde staff workspace</p><h1>Staff login</h1><form action={staffLogin}><label>Staff password<input name="password" type="password" autoComplete="current-password" required autoFocus/></label><button type="submit">Open staff system</button></form>{params.error?<div className="clinic-alert error">The staff password was not accepted.</div>:null}<small>Staff can access Top Ryde bookings, clients and packages. Payroll, expenses, City bookings and time-clock administration remain owner-only.</small></section></main>;
}
