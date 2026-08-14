import { adminLogin, adminLogout } from "./actions";

export function AdminLogin({ error }: { error?: string }) {
  return <main className="clinic-admin-login"><section><div className="clinic-admin-brand">✦ VenuX</div><p>Private clinic administration</p><h1>Clinic dashboard</h1><form action={adminLogin}><label>Admin password<input name="password" type="password" autoComplete="current-password" required autoFocus /></label><button type="submit">Sign in</button></form>{error ? <div className="clinic-alert error">The password was not accepted or your session expired.</div> : null}<small>Customer information is private and only available to authorised clinic staff.</small></section></main>;
}

export function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  const links = [["Dashboard","/admin"],["Bookings","/admin/bookings"],["Clients & membership","/admin/clients"],["Messages","/admin/messages"],["Follow-ups","/admin/follow-ups"],["Treatment prices","/admin/prices"]];
  return <main className="clinic-admin"><aside><a className="clinic-admin-logo" href="/admin"><span>✦</span><strong>VenuX</strong><small>Clinic OS</small></a><nav>{links.map(([label,href])=><a className={active===label?"active":""} href={href} key={href}>{label}</a>)}</nav><form action={adminLogout}><button type="submit">Sign out</button></form></aside><div className="clinic-admin-main">{children}</div></main>;
}

export function Change({ now, last, money=false }: { now:number; last:number; money?:boolean }) {
  const change = last === 0 ? (now === 0 ? 0 : 100) : Math.round(((now-last)/last)*100);
  return <><strong>{money?"$":""}{now.toLocaleString("en-AU")}</strong><span className={change>=0?"up":"down"}>{change>=0?"↑":"↓"} {Math.abs(change)}% vs last month</span></>;
}

export const statusLabel = (status: unknown) => String(status).replace("_"," ");
