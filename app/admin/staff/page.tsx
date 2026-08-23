import type {Metadata} from "next";
import {isAdminAuthenticated} from "../../../lib/admin-auth";
import {getStaff,getStaffClockHistory} from "../../../lib/clinic-admin";
import {addStaffAction,toggleStaffClockAction} from "../actions";
import {AdminLogin,AdminShell} from "../admin-ui";
import "../admin.css";
import "../operations.css";
import "./staff-workspace.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Staff & Time Clock | VenuX",robots:{index:false,follow:false}};

export default async function StaffPage({searchParams}:{searchParams:Promise<{created?:string;clock?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const [staff,history]=await Promise.all([getStaff(),getStaffClockHistory()]);
  return <AdminShell active="Staff & time clock"><header className="clinic-admin-head"><div><p>Team operations</p><h1>Staff & time clock</h1></div><span>{staff.filter(row=>row.active).length} active team members</span></header>
    {params.created?<div className="clinic-alert">Team member added.</div>:null}{params.clock?<div className="clinic-alert">Time clock updated.</div>:null}
    <section className="ops-card ops-section staff-workspace"><header><div><h2>Staff booking workspace</h2><p>Appointments, client search and new client profiles use the same clinic database.</p></div><span>Shared live records</span></header><p>Type a client name or mobile number in the booking workspace to filter existing profiles. If there is no match, staff can create the client while making the appointment.</p><div className="staff-workspace-actions"><a href="/admin/bookings">Open bookings</a><a href="/admin/clients">Search client records</a></div></section>
    <section className="ops-two"><form action={addStaffAction} className="ops-card ops-form"><h2>Add team member</h2><label>Name<input name="name" required/></label><label>Role<select name="role" required defaultValue="Beauty therapist"><option>Beauty therapist</option><option>Dermal therapist</option><option>Nurse</option><option>Reception</option><option>Manager</option></select></label><button>Add staff member</button></form>
      <div className="ops-card"><h2>Clock in / out</h2><div className="staff-clock-list">{staff.length?staff.map(person=><form action={toggleStaffClockAction} key={String(person.id)}><input type="hidden" name="staffId" value={String(person.id)}/><div><strong>{String(person.full_name)}</strong><small>{String(person.role)} · {person.clocked_in?`Clocked in since ${new Date(String(person.last_clock_in)).toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"})}`:"Not clocked in"}</small></div><input name="note" placeholder="Optional note"/><button className={person.clocked_in?"clock-out":""}>{person.clocked_in?"Clock out":"Clock in"}</button></form>):<p>Add staff to begin recording shifts.</p>}</div></div></section>
    <section className="ops-card ops-section"><header><h2>Recent time clock history</h2><span>{history.length} entries</span></header><div className="ops-table"><div className="ops-table-head"><span>Staff</span><span>Clock in</span><span>Clock out</span><span>Hours</span><span>Note</span></div>{history.map(row=><div className="ops-table-row" key={String(row.id)}><strong>{String(row.full_name)}<small>{String(row.role)}</small></strong><span>{new Date(String(row.clock_in)).toLocaleString("en-AU")}</span><span>{row.clock_out?new Date(String(row.clock_out)).toLocaleString("en-AU"):"Working now"}</span><span>{row.hours?`${Number(row.hours).toFixed(2)} h`:"—"}</span><span>{String(row.note||"—")}</span></div>)}</div></section>
  </AdminShell>;
}
