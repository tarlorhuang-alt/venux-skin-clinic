import type {Metadata} from "next";
import {getAdminRole,isAdminAuthenticated} from "../../../../lib/admin-auth";
import {createClientProfileAction} from "../../actions";
import {AdminLogin,AdminShell} from "../../admin-ui";
import "../../admin.css";
import "../[id]/clinical.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"New Client | VenuX Clinic OS",robots:{index:false,follow:false}};

export default async function NewClientPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;const role=await getAdminRole();
  return <AdminShell active="+ New client"><header className="clinic-admin-head"><div><p>Customer database</p><h1>Add a new client</h1></div><span>The mobile number prevents duplicate profiles</span></header>{params.error?<div className="clinic-alert error">Please enter the client name, mobile number and a valid date of birth.</div>:null}<section className="clinical-section"><header><div><span>01</span><h2>Basic client details</h2></div><p>After saving, the full clinical record opens automatically.</p></header><form action={createClientProfileAction} className="clinical-form"><label>Full name<input name="fullName" required autoFocus/></label><label>Mobile<input name="mobile" inputMode="tel" required/></label><label>Email<input name="email" type="email"/></label><label>Date of birth<input name="dob" type="date"/></label><label>Clinic<select name="clinicLocation" defaultValue={role==="staff"?"Top Ryde":""} required>{role==="owner"?<option value="" disabled>Select clinic</option>:null}<option>Top Ryde</option>{role==="owner"?<option>City</option>:null}</select></label><label>Client source<select name="leadSource" defaultValue="Clinic"><option>Clinic</option><option>Google</option><option>Instagram</option><option>RED / Xiaohongshu</option><option>Friend referral</option><option>Walk-in</option><option>Other</option></select></label><button type="submit">Create client profile</button></form></section></AdminShell>;
}
