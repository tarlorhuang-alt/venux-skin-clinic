import type {Metadata} from "next";
import {isAdminAuthenticated} from "../../../lib/admin-auth";
import {getClientPackageBalances} from "../../../lib/clinic-admin";
import {AdminLogin,AdminShell,statusLabel} from "../admin-ui";
import "../admin.css";
import "../premium-overview.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Package Sessions | VenuX Clinic OS",robots:{index:false,follow:false}};

export default async function ClientPackagesPage({searchParams}:{searchParams:Promise<{q?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const search=(params.q??"").trim(),packages=await getClientPackageBalances(search),remaining=packages.reduce((sum,row)=>sum+Number(row.remaining_sessions??0),0);
  return <AdminShell active="Package sessions"><header className="clinic-admin-head"><div><p>Prepaid treatment plans</p><h1>Package sessions</h1></div><span>{packages.length} client packages · {remaining} sessions remaining</span></header>
    <div className="premium-actions"><form method="get" className="premium-search"><label>Search client or package<input name="q" defaultValue={search} placeholder="Client, mobile or package"/></label><button>Search</button>{search?<a href="/admin/client-packages">Clear</a>:null}</form><a className="premium-primary" href="/admin/packages">+ Add package to client</a></div>
    <section className="package-balance-list">{packages.length?packages.map(row=>{const included=Number(row.included_sessions??0),used=Number(row.used_sessions??0),left=Number(row.remaining_sessions??0),percent=included?Math.min(100,Math.round(used/included*100)):0;return <a href={`/admin/clients/${row.client_id}#courses`} key={String(row.client_package_id)}><header><div><strong>{String(row.full_name)}</strong><small>{String(row.mobile)} · {String(row.package_name)}</small></div><span className={`status-pill ${String(row.status)}`}>{statusLabel(row.status)}</span></header><div className="package-balance"><b>{left}</b><span>sessions remaining</span><em>{used} used of {included}</em></div><div className="session-progress"><i style={{width:`${percent}%`}}/></div><footer><span>Paid ${Number(row.amount_paid??0).toLocaleString("en-AU")}</span><span>{row.expires_on?`Expires ${new Date(String(row.expires_on)).toLocaleDateString("en-AU")}`:"No expiry"}</span></footer></a>}):<div className="empty-admin">No client packages match this search.</div>}</section>
  </AdminShell>;
}
