import type {Metadata} from "next";
import {isAdminAuthenticated,isOwnerAuthenticated} from "../../../lib/admin-auth";
import {redirect} from "next/navigation";
import {getOperationsReport} from "../../../lib/clinic-admin";
import {AdminLogin,AdminShell} from "../admin-ui";
import "../admin.css";
import "../operations.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Revenue & Performance | VenuX",robots:{index:false,follow:false}};
const isoSydney=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

export default async function ReportsPage({searchParams}:{searchParams:Promise<{from?:string;to?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;if(!(await isOwnerAuthenticated()))redirect("/admin?error=restricted");const today=isoSydney(),from=/^\d{4}-\d{2}-\d{2}$/.test(params.from??"")?String(params.from):`${today.slice(0,7)}-01`,to=/^\d{4}-\d{2}-\d{2}$/.test(params.to??"")?String(params.to):today;
  const report=await getOperationsReport(from,to),summary=report.summary;
  return <AdminShell active="Revenue & performance"><header className="clinic-admin-head"><div><p>Financial & team reporting</p><h1>Revenue & performance</h1></div><span>Revenue is recorded at start; fixed project wage at completion</span></header>
    <form method="get" className="report-filter"><label>From<input type="date" name="from" defaultValue={from}/></label><label>To<input type="date" name="to" defaultValue={to}/></label><button>Update report</button></form>
    <section className="metric-grid"><article className="metric-card"><small>Recognised revenue</small><strong>${Number(summary.revenue??0).toLocaleString("en-AU")}</strong><span>{from} to {to}</span></article><article className="metric-card"><small>Beautician payroll</small><strong>${Number(summary.payroll??0).toLocaleString("en-AU")}</strong><span>Fixed wages for completed projects</span></article><article className="metric-card"><small>Started services</small><strong>{Number(summary.started??0)}</strong><span>{Number(summary.completed??0)} completed</span></article><article className="metric-card"><small>Average sale</small><strong>${Math.round(Number(summary.average_sale??0)).toLocaleString("en-AU")}</strong><span>Per started service · {Number(summary.no_shows??0)} no-shows</span></article></section>
    <section className="ops-two"><div className="ops-card ops-section"><header><h2>Therapist performance</h2><span>Revenue, wage & started projects</span></header><div className="rank-list">{report.byStaff.map((row,index)=><div key={String(row.staff_name)}><b>{String(index+1).padStart(2,"0")}</b><span><strong>{String(row.staff_name)}</strong><small>{String(row.role||"No staff assigned")} · Wage ${Number(row.payroll??0).toLocaleString("en-AU")}</small></span><span>{Number(row.started)} started</span><em>${Number(row.revenue).toLocaleString("en-AU")}</em></div>)}</div></div><div className="ops-card ops-section"><header><h2>Project performance</h2><span>Best-selling treatments</span></header><div className="rank-list">{report.byTreatment.map((row,index)=><div key={String(row.treatment)}><b>{String(index+1).padStart(2,"0")}</b><span><strong>{String(row.treatment)}</strong><small>{Number(row.started)} started · wage ${Number(row.payroll??0).toLocaleString("en-AU")}</small></span><em>${Number(row.revenue).toLocaleString("en-AU")}</em></div>)}</div></div></section>
    <section className="ops-card ops-section"><header><h2>Daily revenue</h2><span>{report.byDay.length} active dates</span></header><div className="daily-revenue">{report.byDay.map(row=><div key={String(row.requested_date)}><time>{new Date(String(row.requested_date)).toLocaleDateString("en-AU",{day:"2-digit",month:"short"})}</time><span>{Number(row.bookings)} bookings · wage ${Number(row.payroll??0).toLocaleString("en-AU")}</span><strong>${Number(row.revenue).toLocaleString("en-AU")}</strong></div>)}</div></section>
  </AdminShell>;
}
