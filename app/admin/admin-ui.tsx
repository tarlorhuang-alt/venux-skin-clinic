import { adminLogin, adminLogout } from "./actions";
import { getAdminRole } from "../../lib/admin-auth";

export function AdminLogin({ error }: { error?: string }) {
  return <main className="clinic-admin-login"><section><div className="clinic-admin-brand">✦ VenuX</div><p>Private clinic administration</p><h1>Clinic dashboard</h1><form action={adminLogin}><label>Owner or staff password<input name="password" type="password" autoComplete="current-password" required autoFocus /></label><button type="submit">Sign in</button></form>{error ? <div className="clinic-alert error">The password was not accepted or your session expired.</div> : null}<small>Your password opens the correct workspace for your role.</small></section></main>;
}

export async function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  const role=await getAdminRole();
  const links = [["Dashboard","/admin",false],["Bookings","/admin/bookings",false],["Clients & membership","/admin/clients",false],["Packages","/admin/packages",false],["Payroll","/admin/payroll",true],["Revenue & performance","/admin/reports",true],["Expenses","/admin/expenses",true],["Staff & time clock","/admin/staff",false],["Client retention","/admin/retention",false],["Messages","/admin/messages",false],["Follow-ups","/admin/follow-ups",false]] as const;
  return <main className="clinic-admin"><aside><a className="clinic-admin-logo" href="/admin"><span>✦</span><strong>VenuX</strong><small>{role==="owner"?"Owner system":"Staff system"}</small></a><nav>{links.filter(([, ,ownerOnly])=>!ownerOnly||role==="owner").map(([label,href])=><a className={active===label?"active":""} href={href} key={href}>{label}</a>)}</nav><form action={adminLogout}><button type="submit">Sign out</button></form></aside><div className="clinic-admin-main">{children}</div></main>;
}

export function Change({ now, last, money=false }: { now:number; last:number; money?:boolean }) {
  const change = last === 0 ? (now === 0 ? 0 : 100) : Math.round(((now-last)/last)*100);
  return <><strong>{money?"$":""}{now.toLocaleString("en-AU")}</strong><span className={change>=0?"up":"down"}>{change>=0?"↑":"↓"} {Math.abs(change)}% vs last month</span></>;
}

export const statusLabel = (status: unknown) => String(status).replace("_"," ");
