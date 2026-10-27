import {randomUUID} from "node:crypto";
import type {ServicePackageOption} from "./service-checkout-fields";
type Row=Record<string,unknown>;
export default function ServiceAccountPanel({id,date,balance,packages,templates,events=[],action}:{id:number;date:string;balance:number;packages:ServicePackageOption[];templates:Row[];events?:Array<{type:string;amount:number;method:string}>;action:(form:FormData)=>void|Promise<void>}){
 const context=(kind:string)=><><input type="hidden" name="id" value={id}/><input type="hidden" name="date" value={date}/><input type="hidden" name="accountKind" value={kind}/><input type="hidden" name="accountKey" value={randomUUID()}/></>;
 const method=<label>Payment received by<select name="accountMethod" required defaultValue=""><option value="" disabled>Select method</option>{['Cash','Card','Bank transfer','Other'].map(value=><option key={value}>{value}</option>)}</select></label>;
 return <section className="service-account-panel"><h3>Client card & package</h3><p><strong>Membership balance: ${Number(balance).toFixed(2)}</strong></p><p>{packages.length?packages.map(item=>`${item.name}: ${item.remaining} sessions`).join(' · '):'No available package for this treatment.'}</p>
  {events.map((event,index)=><small className="service-account-event" key={index}>{event.type==='recharge'?'Card recharged':'Package purchased'} · ${Number(event.amount).toFixed(2)} · {event.method}</small>)}
  <details><summary>Recharge / open membership card</summary><form action={action}>{context('recharge')}<label>Recharge amount received (AUD)<input name="accountAmount" type="number" min="0.01" step="0.01" required/></label>{method}<button>Record recharge</button></form></details>
  <details><summary>Buy a package</summary>{templates.length?<form action={action}>{context('package')}<label>Package<select name="accountPackageId" required defaultValue=""><option value="" disabled>Select package</option>{templates.map(item=><option value={String(item.id)} key={String(item.id)}>{String(item.package_name)} · ${Number(item.package_price).toFixed(2)}</option>)}</select></label><label>Package payment received (AUD)<input name="accountAmount" type="number" min="0" step="0.01" required/></label>{method}<button>Record package purchase</button></form>:<p>No package templates are available.</p>}</details>
 </section>;
}
