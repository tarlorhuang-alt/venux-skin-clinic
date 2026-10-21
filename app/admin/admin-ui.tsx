import AdminFrame from "./admin-frame";
import { adminLogin, adminLogout } from "./actions";
import { getAdminRole } from "../../lib/admin-auth";

export function AdminLogin({ error }: { error?: string }) {
  return <main className="clinic-admin-login"><section><div className="clinic-admin-brand">✦ ISA</div><p>Private clinic administration</p><h1>Clinic dashboard</h1><form action={adminLogin}><label>Password<input name="password" type="password" autoComplete="current-password" required autoFocus /></label><button type="submit">Sign in</button></form>{error ? <div className="clinic-alert error">The password was not accepted or your session expired.</div> : null}</section></main>;
}

export async function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  const role=await getAdminRole();
  const links = [["Dashboard","/admin",false],["Calendar","/admin/calendar",false],["Appointments","/admin/bookings",false],["Team clock & revenue","/admin/team",false],["+ New client","/admin/clients/new",false],["Clients","/admin/clients",false],["Membership balances","/admin/memberships",false],["Package sessions","/admin/client-packages",false],["Products","/admin/products",false],["Follow-ups","/admin/follow-ups",false],["Payroll","/admin/payroll",true],["Revenue & performance","/admin/reports",true],["Expenses","/admin/expenses",true],["Staff & time clock","/admin/staff",true],["Client retention","/admin/retention",false],["Messages","/admin/messages",false]] as const;
  const icons:Record<string,string>={Dashboard:"DB",Calendar:"CA",Appointments:"AP","Team clock & revenue":"TC","+ New client":"+","Clients":"CL","Membership balances":"MB","Package sessions":"PS",Products:"PR","Follow-ups":"FU",Payroll:"PY","Revenue & performance":"RP",Expenses:"EX","Staff & time clock":"ST","Client retention":"CR",Messages:"MS"};
  const sidebar=<><a className="clinic-admin-logo" href="/admin" aria-label="ISA clinic dashboard"><span>✦</span><strong>ISA</strong><small>{role==="owner"?"Owner workspace":"Top Ryde workspace"}</small></a><nav id="clinic-navigation">{links.filter(([, ,ownerOnly])=>!ownerOnly||role==="owner").map(([label,href])=><a className={active===label?"active":""} href={href} key={href} title={label} aria-label={label} aria-current={active===label?"page":undefined}><span className="navigation-icon" aria-hidden="true">{icons[label]}</span><span className="navigation-label">{label}</span></a>)}</nav><form action={adminLogout}><button type="submit" title="Sign out" aria-label="Sign out"><span className="navigation-icon" aria-hidden="true">↗</span><span className="navigation-label">Sign out</span></button></form></>;
  return <AdminFrame sidebar={sidebar}>{children}</AdminFrame>;
}

export function Change({ now, last, money=false }: { now:number; last:number; money?:boolean }) {
  const change = last === 0 ? (now === 0 ? 0 : 100) : Math.round(((now-last)/last)*100);
  return <><strong>{money?"$":""}{now.toLocaleString("en-AU")}</strong><span className={change>=0?"up":"down"}>{change>=0?"↑":"↓"} {Math.abs(change)}% vs last month</span></>;
}

export const statusLabel = (status: unknown) => String(status).replace("_"," ");
