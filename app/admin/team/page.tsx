import type {Metadata} from "next";
import {isAdminAuthenticated} from "../../../lib/admin-auth";
import {getStaff,getStaffRevenue} from "../../../lib/clinic-admin";
import {staffClockAction} from "../actions";
import {AdminLogin,AdminShell} from "../admin-ui";
import "../admin.css";
import "../operations.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Team Clock & Revenue | VenuX",robots:{index:false,follow:false}};

const todaySydney=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const sydneyDateTime=(input:unknown)=>new Intl.DateTimeFormat("en-AU",{timeZone:"Australia/Sydney",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}).format(new Date(String(input)));

export default async function TeamPage({searchParams}:{searchParams:Promise<{clock?:string;error?:string;from?:string;to?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const today=todaySydney(),monthStart=`${today.slice(0,7)}-01`;
  const requestedFrom=/^\d{4}-\d{2}-\d{2}$/.test(params.from??"")?String(params.from):monthStart;
  const requestedTo=/^\d{4}-\d{2}-\d{2}$/.test(params.to??"")?String(params.to):today;
  const from=requestedFrom<=requestedTo?requestedFrom:requestedTo,to=requestedFrom<=requestedTo?requestedTo:requestedFrom;
  const [staff,revenue]=await Promise.all([getStaff(),getStaffRevenue(from,to)]),activeStaff=staff.filter(person=>person.active);
  const totalRevenue=revenue.reduce((sum,row)=>sum+Number(row.revenue??0),0);
  return <AdminShell active="Team clock & revenue">
    <header className="clinic-admin-head"><div><p>Top Ryde team workspace</p><h1>Clock & staff revenue</h1></div><span>Australia/Sydney live time</span></header>
    {params.clock?<div className="clinic-alert">Clock status updated.</div>:null}
    {params.error?<div className="clinic-alert error">The PIN was not accepted. Ask the owner to set or reset your clock PIN.</div>:null}
    <section className="ops-card ops-section"><header><div><h2>Clock in / out</h2><p>Find your own name and enter your private PIN.</p></div><span>{activeStaff.filter(person=>person.clocked_in).length} working now</span></header>
      <div className="staff-clock-list">{activeStaff.map(person=><form action={staffClockAction} key={String(person.id)}><input type="hidden" name="staffId" value={String(person.id)}/><div><strong>{String(person.full_name)}</strong><small>{String(person.role)} · {person.clocked_in?`Clocked in since ${sydneyDateTime(person.last_clock_in)}`:"Not clocked in"}</small></div><input name="pin" type="password" inputMode="numeric" pattern="[0-9]{4,8}" minLength={4} maxLength={8} required placeholder="Personal PIN" autoComplete="current-password"/><button className={person.clocked_in?"clock-out":""} disabled={!person.has_clock_pin}>{person.has_clock_pin?(person.clocked_in?"Clock out":"Clock in"):"Ask owner for PIN"}</button></form>)}</div>
    </section>
    <section className="ops-card ops-section"><header><div><h2>Revenue by staff</h2><p>Started and completed Top Ryde treatments only. Payroll is not shown.</p></div><span>Total ${totalRevenue.toLocaleString("en-AU")}</span></header>
      <form method="get" className="report-filter"><label>From<input type="date" name="from" defaultValue={from}/></label><label>To<input type="date" name="to" defaultValue={to}/></label><button>Update</button></form>
      <div className="rank-list">{revenue.map((row,index)=><div key={String(row.id)}><b>{String(index+1).padStart(2,"0")}</b><span><strong>{String(row.full_name)}</strong><small>{String(row.role)} · {Number(row.completed)} completed</small></span><span>{Number(row.started)} started</span><em>${Number(row.revenue).toLocaleString("en-AU")}</em></div>)}</div>
    </section>
  </AdminShell>;
}
