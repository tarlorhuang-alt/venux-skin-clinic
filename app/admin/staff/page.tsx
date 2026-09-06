import type {Metadata} from "next";
import {getAdminRole,isAdminAuthenticated} from "../../../lib/admin-auth";
import {getStaff,getStaffClockHistory} from "../../../lib/clinic-admin";
import {addStaffAction,toggleStaffClockAction,updateStaffClockAction} from "../actions";
import {AdminLogin,AdminShell} from "../admin-ui";
import {LiveClockStatus} from "./live-clock-status";
import "../admin.css";
import "../operations.css";
import "./staff-workspace.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Staff & Time Clock | VenuX",robots:{index:false,follow:false}};
const sydneyDateTime=(input:unknown)=>new Intl.DateTimeFormat("en-AU",{timeZone:"Australia/Sydney",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).format(new Date(String(input)));
const sydneyInput=(input:unknown)=>{if(!input)return "";const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(String(input)));const get=(type:string)=>parts.find(part=>part.type===type)?.value??"";return `${get("year")}-${get("month")}-${get("day")}T${get("hour").replace("24","00")}:${get("minute")}`;};

export default async function StaffPage({searchParams}:{searchParams:Promise<{created?:string;clock?:string;edited?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const role=await getAdminRole(),[staff,history]=await Promise.all([getStaff(),getStaffClockHistory()]);
  return <AdminShell active="Staff & time clock"><header className="clinic-admin-head"><div><p>Team operations</p><h1>Staff & time clock</h1></div><span>{staff.filter(row=>row.active).length} active team members</span></header>
    <LiveClockStatus/>
    {params.created?<div className="clinic-alert">Team member added.</div>:null}{params.clock||params.edited?<div className="clinic-alert">Time clock updated in Sydney time.</div>:null}{params.error?<div className="clinic-alert error">The time entry could not be updated. Clock out must be after clock in.</div>:null}
    <section className="ops-card ops-section staff-workspace"><header><div><h2>Staff booking workspace</h2><p>Appointments, client search and new client profiles use the same clinic database.</p></div><span>Shared live records</span></header><p>Type a client name or mobile number in the booking workspace to filter existing profiles. If there is no match, staff can create the client while making the appointment.</p><div className="staff-workspace-actions"><a href="/admin/bookings">Open bookings</a><a href="/admin/clients">Search client records</a></div></section>
    <section className="ops-two"><form action={addStaffAction} className="ops-card ops-form"><h2>Add team member</h2><label>Name<input name="name" required/></label><label>Role<select name="role" required defaultValue="Beauty therapist"><option>Beauty therapist</option><option>Dermal therapist</option><option>Nurse</option><option>Reception</option><option>Manager</option></select></label><button>Add staff member</button></form>
      <div className="ops-card"><h2>Clock in / out</h2><div className="staff-clock-list">{staff.length?staff.map(person=><form action={toggleStaffClockAction} key={String(person.id)}><input type="hidden" name="staffId" value={String(person.id)}/><div><strong>{String(person.full_name)}</strong><small>{String(person.role)} · {person.clocked_in?`Clocked in since ${sydneyDateTime(person.last_clock_in)}`:"Not clocked in"}</small></div><input name="note" placeholder="Optional note"/><button className={person.clocked_in?"clock-out":""}>{person.clocked_in?"Clock out":"Clock in"}</button></form>):<p>Add staff to begin recording shifts.</p>}</div></div></section>
    <section className="ops-card ops-section"><header><h2>Recent time clock history</h2><span>{history.length} entries · Australia/Sydney</span></header><div className={`ops-table ${role==="owner"?"clock-owner-table":""}`}><div className="ops-table-head"><span>Staff</span><span>Clock in</span><span>Clock out</span><span>Hours</span><span>Note</span></div>{history.map(row=>role==="owner"?<form action={updateStaffClockAction} className="ops-table-row clock-history-edit" key={String(row.id)}><input type="hidden" name="id" value={String(row.id)}/><strong>{String(row.full_name)}<small>{String(row.role)}</small></strong><input name="clockIn" type="datetime-local" defaultValue={sydneyInput(row.clock_in)} required aria-label={`Clock in for ${row.full_name}`}/><input name="clockOut" type="datetime-local" defaultValue={sydneyInput(row.clock_out)} aria-label={`Clock out for ${row.full_name}`}/><span>{row.hours?`${Number(row.hours).toFixed(2)} h`:"—"}</span><label><input name="note" defaultValue={String(row.note||"")} placeholder="Note" aria-label={`Clock note for ${row.full_name}`}/><button>Save</button></label></form>:<div className="ops-table-row" key={String(row.id)}><strong>{String(row.full_name)}<small>{String(row.role)}</small></strong><span>{sydneyDateTime(row.clock_in)}</span><span>{row.clock_out?sydneyDateTime(row.clock_out):"Working now"}</span><span>{row.hours?`${Number(row.hours).toFixed(2)} h`:"—"}</span><span>{String(row.note||"—")}</span></div>)}</div></section>
  </AdminShell>;
}
