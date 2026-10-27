"use client";
import {useId,useState} from "react";
export type ServicePackageOption={id:number;name:string;service:string;remaining:number};
type ServiceOption={name:string;price:number|null};
export default function ServiceCheckoutFields({base,deposit,balance,packages,selectedPackageId,services=[]}:{base:number;deposit:number;balance:number;packages:ServicePackageOption[];selectedPackageId?:number;services?:ServiceOption[]}){
 const listId=useId();
 const [packageId,setPackageId]=useState(packages.some(p=>Number(p.id)===selectedPackageId)?String(selectedPackageId):"");
 const [membership,setMembership]=useState("0"),[payments,setPayments]=useState({cash:"0",card:"0",transfer:"0",other:"0"});
 const [addOns,setAddOns]=useState<Array<{name:string;amount:string}>>([]);
 const cents=(value:string|number)=>Math.round((Number(value)||0)*100);
 const total=cents(base)+addOns.reduce((sum,item)=>sum+cents(item.amount),0);
 const packageCredit=packageId?Math.max(0,cents(base)-cents(deposit)):0;
 const remaining=total-cents(deposit)-packageCredit-cents(membership)-Object.values(payments).reduce((sum,value)=>sum+cents(value),0);
 const money=(value:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(value/100);
 function updateAddOn(index:number,key:'name'|'amount',value:string){
  setAddOns(current=>current.map((item,i)=>{
   if(i!==index)return item;
   const service=key==='name'?services.find(s=>s.name===value):undefined;
   return {...item,[key]:value,...(service?.price!=null?{amount:String(service.price)}:{})};
  }));
 }
 return <fieldset className="service-payment-fields"><legend>Add-ons & combination payment</legend><input type="hidden" name="checkoutVersion" value="1"/>
  <p>Base treatment: {money(cents(base))} · Deposit already paid: {money(cents(deposit))}</p>
  <datalist id={listId}>{services.map(service=><option value={service.name} key={service.name}/>)}</datalist>
  {addOns.map((item,index)=><div className="service-addon" key={index}><label>Add-on {index+1}<input list={listId} name={`addOnName${index}`} value={item.name} maxLength={160} required onChange={e=>updateAddOn(index,'name',e.target.value)} placeholder="Choose or type treatment / product"/></label><label>Price (AUD)<input name={`addOnAmount${index}`} type="number" min="0" step="0.01" required value={item.amount} onChange={e=>updateAddOn(index,'amount',e.target.value)}/></label><button type="button" onClick={()=>setAddOns(current=>current.filter((_,i)=>i!==index))}>Remove add-on</button></div>)}
  {addOns.length<8?<button type="button" onClick={()=>setAddOns(current=>[...current,{name:"",amount:"0"}])}>+ Add add-on</button>:null}
  <label>Use prepaid package<select name="packageItemId" value={packageId} onChange={e=>setPackageId(e.target.value)}><option value="">Do not use a package</option>{packages.map(item=><option value={String(item.id)} key={item.id}>{item.name} · {item.remaining} sessions left</option>)}</select></label>
  {packageId?<small>Uses one session for the base treatment. Add-ons are charged separately.</small>:null}
  <label>Membership balance to use (AUD) · available {money(cents(balance))}<input name="membershipUsed" type="number" min="0" max={balance} step="0.01" value={membership} onChange={e=>setMembership(e.target.value)}/></label>
  {balance>0?<button type="button" onClick={()=>setMembership(String(Math.min(cents(balance),Math.max(0,total-cents(deposit)-packageCredit-Object.values(payments).reduce((sum,value)=>sum+cents(value),0)))/100))}>Use available membership balance</button>:null}
  <p>Enter only new treatment/add-on payments below. Recharges, package purchases and the deposit are recorded separately.</p>
  <div className="service-payment-grid">{([['cash','Cash'],['card','Card'],['transfer','Bank transfer'],['other','Other']] as const).map(([field,label])=><label key={field}>{label} (AUD)<input name={field} type="number" min="0" step="0.01" value={payments[field]} onChange={e=>setPayments(current=>({...current,[field]:e.target.value}))}/></label>)}</div>
  <div className="service-checkout-total" aria-live="polite"><strong>Treatment + add-ons: {money(total)}</strong>{packageId?<span>Covered by package: {money(packageCredit)}</span>:null}<strong>{remaining<0?`Overpayment: ${money(-remaining)} — adjust amounts`:`Outstanding: ${money(remaining)}`}</strong>{remaining>0?<small>Any unpaid amount remains on the receipt as outstanding.</small>:null}</div>
 </fieldset>;
}
