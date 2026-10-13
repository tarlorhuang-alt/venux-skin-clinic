import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getAdminRole} from "../../lib/admin-auth";
import {staffLogin} from "./actions";
import "../admin/admin.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Staff Login | ISA Clinic OS",robots:{index:false,follow:false}};

export default async function StaffLoginPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;
  if(await getAdminRole())redirect("/admin/bookings");
  return <main className="clinic-admin-login"><section><div className="clinic-admin-brand">✦ ISA</div><p>Top Ryde clinic workspace</p><h1>Clinic login</h1><form action={staffLogin}><label>Password<input name="password" type="password" autoComplete="current-password" required autoFocus/></label><button type="submit">Sign in</button></form>{params.error?<div className="clinic-alert error">The password was not accepted.</div>:null}<small>Sign in to access the clinic workspace.</small></section></main>;
}
