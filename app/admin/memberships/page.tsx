import type {Metadata} from "next";
import {isAdminAuthenticated} from "../../../lib/admin-auth";
import {getMembershipBalanceClients} from "../../../lib/clinic-admin";
import {AdminLogin,AdminShell} from "../admin-ui";
import "../admin.css";
import "../premium-overview.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Membership Balances | VenuX Clinic OS",robots:{index:false,follow:false}};

export default async function MembershipBalancesPage({searchParams}:{searchParams:Promise<{q?:string;error?:string}>}){
  const params=await searchParams;if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  const search=(params.q??"").trim(),members=await getMembershipBalanceClients(search),total=members.reduce((sum,row)=>sum+Number(row.balance??0),0);
  return <AdminShell active="Membership balances"><header className="clinic-admin-head"><div><p>Premium clients</p><h1>Membership balances</h1></div><span>{members.length} cards · ${total.toLocaleString("en-AU",{minimumFractionDigits:2})} total balance</span></header>
    <form method="get" className="premium-search"><label>Search member<input name="q" defaultValue={search} placeholder="Client name, mobile or email"/></label><button>Search</button>{search?<a href="/admin/memberships">Clear</a>:null}</form>
    <section className="premium-grid">{members.length?members.map(member=><a href={`/admin/clients/${member.id}#membership`} key={String(member.id)}><header><strong>{String(member.full_name)}</strong><span className={`clinic-location-badge ${String(member.clinic_location)==="City"?"city":"ryde"}`}>{String(member.clinic_location||"Top Ryde")}</span></header><small>{String(member.mobile)}{member.email?` · ${String(member.email)}`:""}</small><div><span>Available card balance</span><b>${Number(member.balance??0).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2})}</b></div><footer>{Number(member.completed_visits)} completed visits · {member.last_visit?`Last ${new Date(String(member.last_visit)).toLocaleDateString("en-AU")}`:"No completed visits"}</footer></a>):<div className="empty-admin">No membership cards match this search.</div>}</section>
  </AdminShell>;
}
