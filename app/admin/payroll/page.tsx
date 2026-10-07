import type {Metadata} from "next";
import {isAdminAuthenticated,isOwnerAuthenticated} from "../../../lib/admin-auth";
import {redirect} from "next/navigation";
import {getPayrollReport} from "../../../lib/clinic-admin";
import {AdminLogin,AdminShell} from "../admin-ui";
import "../admin.css";
import "../operations.css";
import "./payroll.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Payroll | ISA Clinic OS",robots:{index:false,follow:false}};
const isoSydney=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const weekBounds=(date:string)=>{const value=new Date(`${date}T00:00:00Z`),day=value.getUTCDay()||7,monday=new Date(value);monday.setUTCDate(value.getUTCDate()-day+1);const sunday=new Date(monday);sunday.setUTCDate(monday.getUTCDate()+6);return {from:monday.toISOString().slice(0,10),to:sunday.toISOString().slice(0,10)};};

export default async function PayrollPage({searchParams}:{searchParams:Promise<{from?:string;to?:string;error?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;if(!(await isOwnerAuthenticated()))redirect("/admin?error=restricted");
  const today=isoSydney(),week=weekBounds(today),from=/^\d{4}-\d{2}-\d{2}$/.test(params.from??"")?String(params.from):week.from,to=/^\d{4}-\d{2}-\d{2}$/.test(params.to??"")?String(params.to):week.to;
  const report=await getPayrollReport(from,to),total=report.summary.reduce((sum,row)=>sum+Number(row.wage??0),0),hours=report.summary.reduce((sum,row)=>sum+Number(row.hours??0),0),shifts=report.summary.reduce((sum,row)=>sum+Number(row.shifts??0),0);
  return <AdminShell active="Payroll"><header className="clinic-admin-head"><div><p>Clocked-hour wages</p><h1>Weekly payroll</h1></div><span>Calculated from staff clock-in and clock-out records</span></header>
    <form method="get" className="report-filter"><label>From<input type="date" name="from" defaultValue={from}/></label><label>To<input type="date" name="to" defaultValue={to}/></label><button>Update payroll</button></form>
    <section className="metric-grid"><article className="metric-card"><small>Total payroll</small><strong>${total.toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><span>{from} to {to}</span></article><article className="metric-card"><small>Clocked hours</small><strong>{hours.toFixed(2)} h</strong><span>{shifts} recorded shifts</span></article><article className="metric-card"><small>Dannie</small><strong>$32 / hour</strong><span>Calculated from clocked time</span></article><article className="metric-card"><small>Mei</small><strong>$35 / hour</strong><span>Calculated from clocked time</span></article></section>
    <section className="ops-card ops-section"><header><h2>Weekly pay by employee</h2><span>{report.summary.length} active team members</span></header><div className="payroll-summary">{report.summary.map(row=><article key={String(row.staff_id)}><span>{String(row.role)}</span><strong>{String(row.full_name)}</strong><small>{Number(row.hours??0).toFixed(2)} hours · {Number(row.shifts??0)} shifts · ${Number(row.hourly_rate??0).toFixed(2)}/h</small><b>${Number(row.wage??0).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2})}</b></article>)}</div></section>
    <section className="ops-card ops-section"><header><h2>Clock record details</h2><span>{report.rows.length} entries</span></header><div className="ops-table payroll-table"><div className="ops-table-head"><span>Employee</span><span>Clock in</span><span>Clock out</span><span>Hours & note</span><span>Pay</span></div>{report.rows.map(row=><div className="ops-table-row" key={String(row.id)}><strong>{String(row.staff_name)}<small>${Number(row.hourly_rate??0).toFixed(2)} / hour</small></strong><span>{new Date(String(row.clock_in)).toLocaleString("en-AU",{timeZone:"Australia/Sydney",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</span><span>{row.clock_out?new Date(String(row.clock_out)).toLocaleString("en-AU",{timeZone:"Australia/Sydney",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"Working now"}</span><span>{Number(row.hours??0).toFixed(2)} h<small>{String(row.note||"No note")}</small></span><strong>${Number(row.wage??0).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>)}</div></section>
  </AdminShell>;
}
