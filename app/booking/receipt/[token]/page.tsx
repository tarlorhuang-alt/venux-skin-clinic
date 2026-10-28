import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVisitReceipt } from "../../../../lib/clinic-admin";
import { receiptSummary,type ReceiptSnapshot } from "../../../../lib/receipt-summary";
import { careSlugs } from "../../../../lib/care-guides";
import CareGuide from "../../../care/treatment-guide";
import PrintButton from "./print-button";
import "./receipt.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Receipt & after-care | ISA Skin Clinic",robots:{index:false,follow:false},referrer:"no-referrer"};
const money=(value:number)=>new Intl.NumberFormat("en-AU",{style:"currency",currency:"AUD"}).format(Number(value));
export default async function ReceiptPage({params}:{params:Promise<{token:string}>}){
  const receipt=await getVisitReceipt((await params).token);if(!receipt)notFound();
  const value=receipt.snapshot as ReceiptSnapshot,summary=receiptSummary(value);
  const date=new Date(String(receipt.created_at)).toLocaleString("en-AU",{timeZone:"Australia/Sydney"});
  return <div className="visit-document"><section className="visit-receipt">
    <p className="receipt-brand">ISA SKIN CLINIC & AESTHETICS</p><h1>Receipt & visit summary</h1>
    <p>{value.clinic}{value.abn?<><br/>ABN {value.abn}</>:null}</p>
    <div className="receipt-meta"><p><strong>Receipt</strong><br/>ISA-{String(receipt.id).padStart(6,"0")}</p><p><strong>Issued · Sydney time</strong><br/>{date}</p><p><strong>Client</strong><br/>{value.name}</p></div>
    <h2>{value.treatment}</h2><p>Treatment completed: {new Date(value.completedAt).toLocaleDateString("en-AU",{timeZone:"Australia/Sydney"})}</p>
    <dl><div><dt>Treatment & add-on value</dt><dd>{money(value.total)}</dd></div>{value.addOns?.map((item,index)=><div key={`addon-${index}`}><dt>Add-on · {item.name}</dt><dd>{money(item.amount)} (included above)</dd></div>)}<div><dt>Previously paid deposit</dt><dd>{money(value.deposit)}</dd></div><div><dt>New payment · {value.method}</dt><dd>{money(value.paidNow)}</dd></div>{value.payments?.map((part,index)=><div key={`payment-${index}`}><dt>Payment part · {part.method}</dt><dd>{money(part.amount)}</dd></div>)}<div><dt>Membership credit used</dt><dd>{money(value.membership)}</dd></div>
    {value.packageUsed?<div><dt>Prepaid package</dt><dd>1 session used{value.packageCredit!==undefined?` · ${money(value.packageCredit)} covered`:""}{value.packageRemaining!==null?`; ${value.packageRemaining} remaining at issue`:""}</dd></div>:null}
    <div className="receipt-total"><dt>Recorded payments, including deposit</dt><dd>{money(summary.received)}</dd></div>
    {summary.balance!==null?<div><dt>Balance outstanding</dt><dd>{money(summary.balance)}</dd></div>:null}</dl>
    {value.accountTransactions?.length?<><h2>Card recharge & package purchases</h2><dl>{value.accountTransactions.map((item,index)=><div key={index}><dt>{item.type==='recharge'?'Card recharge':'Package purchase'} · {item.method}</dt><dd>{money(item.amount)}</dd></div>)}</dl><p>These account purchases are separate from the treatment payments above.</p></>:null}
    <p>Package sessions and membership credit are shown separately from new payments. This document records the visit and payments entered by the clinic; it is not a tax invoice. Contact the clinic for corrections or a tax invoice.</p>
    <PrintButton/><p className="receipt-private">Keep this private link secure. Anyone with the link can view this receipt.</p>
  </section><section aria-label="After-care instructions">{careSlugs(value.treatment).map((treatment,index)=><CareGuide key={treatment} params={Promise.resolve({treatment,stage:"after"})} showUniversal={index===careSlugs(value.treatment).length-1}/>)}</section></div>;
}
