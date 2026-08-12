import type { Metadata } from "next";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import { getPriceMap, priceCatalogue } from "../../../lib/pricing";
import { login, logout, savePrices } from "./actions";
import "./prices-admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Price Manager | VenuX", robots: { index: false, follow: false } };

export default async function PriceAdmin({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const params = await searchParams;
  if (!(await isAdminAuthenticated())) {
    return <main className="admin-login"><section><div className="admin-mark">✦ VenuX</div><p>Private clinic administration</p><h1>Price manager</h1><form action={login}><label>Admin password<input name="password" type="password" autoComplete="current-password" required autoFocus /></label><button type="submit">Sign in</button></form>{params.error ? <p className="admin-error">The password was not accepted. Please try again.</p> : null}<small>This page is not visible in the public navigation.</small></section></main>;
  }

  const prices = await getPriceMap();
  const groups = Map.groupBy(priceCatalogue, (item) => item.group);
  return <main className="price-admin">
    <header><div><span>✦ VenuX Private Admin</span><h1>Treatment prices</h1><p>Enter the regular price and choose whether a member pays 80% or 85%. The member price is calculated automatically when you save.</p></div><form action={logout}><button className="admin-logout" type="submit">Sign out</button></form></header>
    {params.saved ? <div className="admin-success" role="status">Prices saved. Public treatment pages now use the new values.</div> : null}
    {params.error ? <div className="admin-error" role="alert">A price was invalid or your session expired. No unsafe value was saved.</div> : null}
    <form action={savePrices} className="admin-price-form">
      {[...groups.entries()].map(([group, items]) => <section className="admin-price-group" key={group}><div className="admin-group-heading"><h2>{group}</h2><span>{items.length} prices</span></div><div className="admin-price-head"><span>Treatment / area</span><span>Regular price</span><span>Member pays</span><span>Calculated member price</span></div>{items.map((item) => { const current = prices.get(item.key) ?? item; return <div className="admin-price-row" key={item.key}><label><span>{item.name}</span></label><label className="money-field"><span>$</span><input name={`${item.key}:regular`} type="number" min="0" max="100000" step="1" defaultValue={current.regular} required /></label><label><select name={`${item.key}:rate`} defaultValue={current.memberRate}><option value="80">80% · 20% off</option><option value="85">85% · 15% off</option></select></label><output>${current.member} <small>current</small></output></div>;})}</section>)}
      <div className="admin-save-bar"><div><strong>Ready to update?</strong><span>Saving changes updates the live customer pages.</span></div><button type="submit">Save all prices</button></div>
    </form>
  </main>;
}

