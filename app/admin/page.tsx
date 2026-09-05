import type { Metadata } from "next";
import { getAdminRole,isAdminAuthenticated } from "../../lib/admin-auth";
import { getClinicDashboard } from "../../lib/clinic-admin";
import { AdminLogin, AdminShell, Change, statusLabel } from "./admin-ui";
import "./admin.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Clinic Dashboard | VenuX",robots:{index:false,follow:false}};
const dateLabel=(value:unknown)=>new Date(String(value)).toLocaleDateString("en-AU",{day:"2-digit",month:"short"});

export default async function AdminDashboard({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated())) return <AdminLogin error={params.error}/>;
  const role=await getAdminRole();
  const {stats,upcoming,recent}=await getClinicDashboard();
  return <AdminShell active="Dashboard"><header className="clinic-admin-head"><div><p>{role==="owner"?"Live clinic overview":"Staff booking workspace"}</p><h1>Good morning, VenuX.</h1></div><span>{new Date().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span></header>
    {params.error==="restricted"?<div className="clinic-alert error">Owner access is required for payroll, revenue and expenses.</div>:null}
    <section className="metric-grid"><article className="metric-card"><small>Appointments this month</small><Change now={stats.appointmentsNow} last={stats.appointmentsLast}/></article><article className="metric-card"><small>New clients this month</small><Change now={stats.clientsNow} last={stats.clientsLast}/></article>{role==="owner"?<article className="metric-card"><small>Completed revenue</small><Change now={stats.revenueNow} last={stats.revenueLast} money/></article>:<article className="metric-card"><small>Account access</small><strong>Staff</strong><span>Bookings, clients, packages and clinical follow-up</span></article>}<article className="metric-card"><small>No-shows this month</small><strong>{stats.noShowsNow}</strong><span>Keep status updated for accurate reporting</span></article></section>
    <section className="admin-panels"><div className="admin-panel"><header><h2>Upcoming appointments</h2><a href="/admin/bookings">Manage all →</a></header>{upcoming.length?upcoming.map((row)=><div className="admin-list-row" key={String(row.id)}><time>{dateLabel(row.requested_date)} · {String(row.requested_time)}</time><div><strong>{String(row.full_name)}</strong><small>{String(row.treatment)} · {String(row.clinic)}</small></div><span className={`status-pill ${row.status}`}>{statusLabel(row.status)}</span></div>):<div className="empty-admin">New online requests will appear here automatically.</div>}</div>
      <div className="admin-panel"><header><h2>Recently added</h2><a href="/admin/clients">View clients →</a></header>{recent.length?recent.map((row)=><div className="admin-list-row" key={String(row.id)}><time>{dateLabel(row.requested_date)}</time><div><strong>{String(row.full_name)}</strong><small>{String(row.treatment)}</small></div><span className={`status-pill ${row.status}`}>{statusLabel(row.status)}</span></div>):<div className="empty-admin">No booking requests yet.</div>}</div></section>
  </AdminShell>;
}
