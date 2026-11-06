import {redirect,notFound} from "next/navigation";
import {isOwnerAuthenticated} from "../../../../lib/owner-auth";
import {getClientClinicalRecord,getAppointments,getServiceCheckoutOptions,getActivePackageTemplates,getOwnerServices} from "../../../../lib/clinic-admin";
import OwnerProfileVisit from "../../profile-visit";
import "../../owner.css";
import "../../../admin/admin.css";
import "../../../admin/clients/[id]/clinical.css";
import "../../../admin/bookings/service-checkout.css";
export const dynamic="force-dynamic";
export const metadata={title:"Client profile | ISA",robots:{index:false,follow:false}};
export default async function OwnerClient({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;finished?:string;accountSaved?:string;started?:string}>}){
 if(!(await isOwnerAuthenticated()))redirect('/owner');
 const id=Number((await params).id);if(!Number.isSafeInteger(id)||id<=0)notFound();
 const record=await getClientClinicalRecord(id);if(!record.client)notFound();
 const query=await searchParams,today=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const visits=await getAppointments(today,'',id);
 const [options,templates,services]=await Promise.all([getServiceCheckoutOptions(visits.filter(row=>['confirmed','in_progress'].includes(String(row.status))).map(row=>Number(row.id))),getActivePackageTemplates(),getOwnerServices()]);
 return <main className="owner-app"><header><a href="/owner#schedule">← Appointments</a><h1>{String(record.client.full_name)}</h1><p>{String(record.client.mobile)} · {String(record.client.email||'No email')}</p></header><section id="checkout" className="clinical-section profile-checkout"><h2>Today’s appointments & checkout</h2><p>{today} · Australia/Sydney</p>{query.error?<p role="alert">Please check the payment amounts, package sessions and required fields before trying again.</p>:null}{query.finished||query.accountSaved||query.started?<p role="status">Saved. The latest service and account details are shown below.</p>:null}{visits.length?visits.map(row=><article className="profile-visit" key={String(row.id)}><h3>{String(row.requested_time)} · {String(row.treatment)}</h3><p>{String(row.staff_name||'Unassigned')} · {String(row.status)}</p><div className="profile-visit-operations"><OwnerProfileVisit row={row} date={today} checkout={options.find(option=>Number(option.id)===Number(row.id))} packageTemplates={templates} activeServices={services.filter(service=>service.active)}/></div></article>):<p>No appointments today.</p>}</section><section className="clinical-section"><h2>Treatment comments</h2>{record.comments.map(comment=><p key={String(comment.id)}>{String(comment.comment)} · {String(comment.staff_name||'Beautician')}</p>)}{record.appointments.filter(row=>row.completion_comment).map(row=><p key={String(row.id)}>{String(row.completion_comment)} · {String(row.staff_name||'Beautician')}</p>)}</section></main>;
}
