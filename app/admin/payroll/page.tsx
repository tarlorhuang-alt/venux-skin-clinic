import type {Metadata} from "next";
import {isAdminAuthenticated,isOwnerAuthenticated} from "../../../lib/admin-auth";
import {redirect} from "next/navigation";
import {getPayrollReport} from "../../../lib/clinic-admin";
import {AdminLogin,AdminShell} from "../admin-ui";
import "../admin.css";
import "../operations.css";
import "./payroll.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Payroll | VenuX Clinic OS",robots:{index:false,follow:false}};
const isoSydney=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

export default async function PayrollPage({searchParams}:{searchParams:Promise<{from?:string;to?:string;error?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;if(!(await isOwnerAuthenticated()))redirect("/admin?error=restricted");
  const today=isoSydney(),from=/^\d{4}-\d{2}-\d{2}$/.test(params.from??"")?String(params.from):`${today.slice(0,7)}-01`,to=/^\d{4}-\d{2}-\d{2}$/.test(params.to??"")?String(params.to):today;
  const report=await getPayrollReport(from,to),total=report.summary.reduce((sum,row)=>sum+Number(row.wage??0),0),projects=report.summary.reduce((sum,row)=>sum+Number(row.projects??0),0);
  return <AdminShell active="Payroll"><header className="clinic-admin-head"><div><p>Fixed project wages</p><h1>Beautician payroll</h1></div><span>Wages are added when End service is selected</span></header>
    <form method="get" className="report-filter"><label>From<input type="date" name="from" defaultValue={from}/></label><label>To<input type="date" name="to" defaultValue={to}/></label><button>Update payroll</button></form>
    <section className="metric-grid"><article className="metric-card"><small>Total payroll</small><strong>${total.toLocaleString("en-AU")}</strong><span>{from} to {to}</span></article><article className="metric-card"><small>Completed projects</small><strong>{projects}</strong><span>Only ended services are included</span></article><article className="metric-card"><small>$32 project types</small><strong>AYKO · Facial · DMK</strong><span>Fixed amount per completed project</span></article><article className="metric-card"><small>All other projects</small><strong>$25</strong><span>Injectables, laser and all others</span></article></section>
    <section className="ops-card ops-section"><header><h2>Pay by beautician</h2><span>{report.summary.length} active team members</span></header><div className="payroll-summary">{report.summary.map(row=><article key={String(row.staff_id)}><span>{String(row.role)}</span><strong>{String(row.full_name)}</strong><small>{Number(row.projects)} completed project{Number(row.projects)===1?"":"s"}</small><b>${Number(row.wage).toLocaleString("en-AU")}</b></article>)}</div></section>
    <section className="ops-card ops-section"><header><h2>Completed project details</h2><span>{report.rows.length} entries</span></header><div className="ops-table payroll-table"><div className="ops-table-head"><span>Date & beautician</span><span>Client</span><span>Project & comment</span><span>Start / end</span><span>Wage</span></div>{report.rows.map(row=><div className="ops-table-row" key={String(row.id)}><strong>{new Date(String(row.requested_date)).toLocaleDateString("en-AU")}<small>{String(row.staff_name)}</small></strong><a className="payroll-client" href={`/admin/clients/${String(row.client_id)}`}>{String(row.client_name)}</a><span className="payroll-project">{String(row.treatment)}<small>{String(row.completion_comment||"No comment recorded")}</small></span><span>{row.started_at?new Date(String(row.started_at)).toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"}):"—"} / {row.completed_at?new Date(String(row.completed_at)).toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"}):"—"}</span><strong>${Number(row.staff_wage_amount).toLocaleString("en-AU")}<small>${Number(row.wage_project_rate||row.staff_wage_amount).toLocaleString("en-AU")} manual project fee</small></strong></div>)}</div></section>
  </AdminShell>;
}
