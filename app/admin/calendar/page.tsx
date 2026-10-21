import type {Metadata} from "next";
import DaySchedule from "./day-schedule";
import {getAdminRole,isAdminAuthenticated} from "../../../lib/admin-auth";
import {queueReturnInviteAction} from "../actions";
import {getAppointments,getStaff,getDormantClients} from "../../../lib/clinic-admin";
import {AdminLogin,AdminShell,statusLabel} from "../admin-ui";
import "../admin.css";
import "../bookings/bookings.css";
import "../bookings/bookings-updates.css";
import "./calendar.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Calendar | ISA Skin Clinic & Aesthetics",robots:{index:false,follow:false}};
const todaySydney=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

export default async function CalendarPage({searchParams}:{searchParams:Promise<{date?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin/>;
  const role=await getAdminRole(),location=role==="staff"?"Top Ryde":"";
  const date=/^\d{4}-\d{2}-\d{2}$/.test(params.date??"")?String(params.date):todaySydney();
  const year=Number(date.slice(0,4));
  const [rows,staff,dormantClients]=await Promise.all([getAppointments(date,location),getStaff(),getDormantClients(120)]);
  const visibleRows=rows.filter(row=>["confirmed","in_progress","completed"].includes(String(row.status)));
  const dayCount=visibleRows.length;
  const reminderClients=dormantClients.filter(client=>role==="owner"||String(client.clinic_location)==="Top Ryde").slice(0,6);
  const months=Array.from({length:12},(_,index)=>{
    const first=new Date(Date.UTC(year,index,1));
    return {index,label:first.toLocaleDateString("en-AU",{month:"long",year:"numeric",timeZone:"UTC"}),leading:first.getUTCDay(),days:new Date(Date.UTC(year,index+1,0)).getUTCDate()};
  });
  return <AdminShell active="Calendar">
    <header className="clinic-admin-head"><div><p>Beautician day planner</p><h1>Appointment calendar</h1></div><a className="calendar-new-booking" href={`/admin/bookings?date=${date}#booking`}>+ New appointment</a></header>
    <form method="get" className="day-picker calendar-date-picker"><label>Selected date<input name="date" type="date" defaultValue={date}/></label><button>Show day</button><a href={`/admin/calendar?date=${todaySydney()}`}>Today</a></form>
    <div className="reference-calendar-layout">
      <aside className="mini-calendar-sidebar" aria-label="Choose appointment date">
        <nav className="mini-year-nav"><a href={`/admin/calendar?date=${year-1}-01-01`} aria-label="Previous year">←</a><strong>{year}</strong><a href={`/admin/calendar?date=${year+1}-01-01`} aria-label="Next year">→</a></nav>
        {months.map(month=><section className="mini-month" key={month.index} aria-label={month.label}>
          <h2>{month.label}</h2><div className="mini-weekdays">{["Su","Mo","Tu","We","Th","Fr","Sa"].map(day=><span key={day}>{day}</span>)}</div>
          <div className="mini-month-days">{Array.from({length:month.leading},(_,index)=><span key={`blank-${index}`}/>)}{Array.from({length:month.days},(_,index)=>{
            const iso=`${year}-${String(month.index+1).padStart(2,'0')}-${String(index+1).padStart(2,'0')}`;
            return <a key={iso} href={`/admin/calendar?date=${iso}`} className={iso===date?"selected":iso===todaySydney()?"today":""} aria-current={iso===date?"date":undefined} aria-label={`View appointments on ${iso}`}>{index+1}</a>;
          })}</div>
        </section>)}
      </aside>
      <section className="reference-day-planner" aria-label="Beautician appointments">
        <header className="planner-day-title"><h2>{new Date(`${date}T12:00:00Z`).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",timeZone:"UTC"})}</h2><span>{visibleRows.length} appointments</span></header>
        <DaySchedule rows={rows} staff={staff} date={date}/>
      </section>
    </div>
    {dayCount<3?<section className="low-booking-reminder"><header><div><small>Automatic low-booking reminder</small><h2>Only {dayCount} confirmed appointment{dayCount===1?"":"s"} on this day</h2></div><a href="/admin/retention">Open full retention list →</a></header><p>Consider contacting clients who have not completed a visit for at least 120 days. Marketing SMS is only available where consent is recorded.</p><div>{reminderClients.map(client=><article key={String(client.id)}><strong>{String(client.full_name)}</strong><small>{client.last_visit?`Last visit ${new Date(String(client.last_visit)).toLocaleDateString("en-AU")}`:"No completed visit"}</small><span><a href={`/admin/clients/${client.id}`}>Profile</a><a href={`/admin/bookings?date=${date}&client=${client.id}#booking`}>Book</a></span>{client.marketing_sms_consent&&!client.sms_unsubscribed_at?<form action={queueReturnInviteAction}><input type="hidden" name="clientId" value={String(client.id)}/><input type="hidden" name="returnTo" value={`/admin/calendar?date=${date}`}/><button>Invite</button></form>:<em>Call only</em>}</article>)}</div></section>:null}
  </AdminShell>;
}
