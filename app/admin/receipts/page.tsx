import type { Metadata } from "next";
import { getAdminRole,isAdminAuthenticated } from "../../../lib/admin-auth";
import { getVisitDeliveries,isClickSendConfigured } from "../../../lib/clinic-admin";
import { retryVisitReceiptAction } from "../actions";
import { AdminLogin,AdminShell } from "../admin-ui";
import "../admin.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Visit receipts | ISA Clinic OS",robots:{index:false,follow:false}};
export default async function ReceiptsPage(){
  if(!(await isAdminAuthenticated()))return <AdminLogin/>;
  const rows=await getVisitDeliveries((await getAdminRole())==="staff"?"Top Ryde":"");
  return <AdminShell active="Appointments"><h1>Receipts & after-care delivery</h1><p>Receipts are created when staff end a service and record the new payment. SMS is sent only when service SMS is enabled. “Sent” means accepted by ClickSend, not confirmed delivery.</p>{!isClickSendConfigured()?<p className="clinic-alert error">ClickSend setup required. Configure CLICKSEND_USERNAME and CLICKSEND_API_KEY before sending.</p>:null}<a href="/admin/bookings">← Appointments</a> · <a href="/admin/care-review">Review after-care drafts →</a>
  {rows.map(row=><article key={String(row.id)} style={{padding:20,marginTop:16,border:"1px solid #ddd",borderRadius:12}}><h2>{String(row.full_name)}</h2><p>{String(row.clinic)} · {row.sms_disabled?"SMS disabled":String(row.status??"Not queued")}</p>{row.token?<a href={`/booking/receipt/${row.token}`} target="_blank" rel="noreferrer">Open receipt & after-care / save PDF ↗</a>:<a href={`/admin/receipts/${row.id}`}>Receipt not issued · review payments & create →</a>}{row.last_error?<p role="status">{String(row.last_error)}</p>:null}{row.token&&(["failed","queued"].includes(String(row.status))||!row.outbox_id)&&!row.sms_disabled?<form action={retryVisitReceiptAction}><input type="hidden" name="id" value={String(row.id)}/><button>{row.status==="failed"?"Retry SMS":"Send SMS"}</button></form>:null}</article>)}{!rows.length?<p>No completed visits to display yet.</p>:null}</AdminShell>;
}
