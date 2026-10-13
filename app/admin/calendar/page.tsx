import type {Metadata} from "next";
import type {CSSProperties} from "react";
import {calendarTimeMinutes,calendarTimeLabel,beauticianColour,quarterHourSlots} from "../../../lib/calendar-schedule";
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
const ROW_HEIGHT=30;

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
  const columns=staff.filter(person=>person.active||visibleRows.some(row=>Number(row.staff_id)===Number(person.id))).map(person=>({id:Number(person.id),name:String(person.full_name)}));
  if(visibleRows.some(row=>!row.staff_id)||!columns.length)columns.push({id:0,name:"Unassigned"});
  const earliest=Math.min(360,...visibleRows.map(row=>calendarTimeMinutes(String(row.requested_time))).filter(time=>time<1440));
  const latest=Math.min(1425,Math.max(1260,...visibleRows.map(row=>calendarTimeMinutes(String(row.requested_time))+Number(row.duration_minutes??60)).filter(time=>time<1440)));
  const slots=quarterHourSlots(Math.floor(earliest/15)*15,Math.ceil(latest/15)*15);
  const start=slots[0];
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
        <div className="reference-planner-scroll"><div className="reference-beautician-columns" style={{gridTemplateColumns:`repeat(${columns.length},minmax(230px,1fr))`}}>
          {columns.map(person=>{
            const appointments=visibleRows.filter(row=>Number(row.staff_id??0)===person.id).sort((a,b)=>calendarTimeMinutes(String(a.requested_time))-calendarTimeMinutes(String(b.requested_time)));
            const laneEnds:number[]=[];
            const positioned=appointments.map(row=>{
              const minutes=calendarTimeMinutes(String(row.requested_time));
              let lane=laneEnds.findIndex(end=>end<=minutes);
              if(lane<0)lane=laneEnds.length;
              laneEnds[lane]=minutes+Number(row.duration_minutes??60);
              return {row,minutes,lane};
            });
            const lanes=Math.max(1,laneEnds.length);
            const bookingUrl=(minutes:number)=>`/admin/bookings?date=${date}&time=${encodeURIComponent(calendarTimeLabel(minutes))}${person.id?`&staff=${person.id}`:""}#booking`;
            return <section className="reference-beautician-column" key={person.id} style={{"--beautician-colour":person.id?beauticianColour(person.id):"#dce5e9"} as CSSProperties} aria-label={`${person.name} appointments`}>
              <a className="reference-beautician-heading" href={`/admin/bookings?date=${date}${person.id?`&staff=${person.id}`:""}#booking`}><strong>ISA Beauty · {person.name}</strong><small>{appointments.length} appointment{appointments.length===1?"":"s"}</small></a>
              <div className="reference-column-timeline" style={{height:slots.length*ROW_HEIGHT}}>
                {slots.map((minutes,index)=>{
                  const occupied=appointments.find(row=>calendarTimeMinutes(String(row.requested_time))<=minutes&&calendarTimeMinutes(String(row.requested_time))+Number(row.duration_minutes??60)>minutes);
                  const href=occupied?`/admin/bookings?date=${date}#appointment-${occupied.id}`:bookingUrl(minutes);
                  return <div className={`reference-quarter-row ${minutes%60===0?"hour-start":""}`} key={minutes} style={{top:index*ROW_HEIGHT,height:ROW_HEIGHT}}><a className="reference-time-label" href={href} aria-label={`${person.name}, ${calendarTimeLabel(minutes)}${occupied?', manage appointment':', new appointment'}`}>{minutes%60===0?calendarTimeLabel(minutes):String(minutes%60)}</a><a className="reference-empty-slot" href={href} aria-label={`${occupied?'Manage appointment':'Book'} with ${person.name} at ${calendarTimeLabel(minutes)}`}/></div>;
                })}
                {positioned.map(({row,minutes,lane})=><a className="reference-booking-block" href={`/admin/bookings?date=${date}#appointment-${row.id}`} key={String(row.id)} style={{top:(minutes-start)/15*ROW_HEIGHT,height:Math.max(ROW_HEIGHT,(Number(row.duration_minutes??60)/15)*ROW_HEIGHT)-3,left:`calc(68px + (100% - 68px) * ${lane/lanes})`,width:`calc((100% - 68px) / ${lanes} - 4px)`}}><strong>{String(row.full_name)}</strong><span>{String(row.treatment)}</span><small>{String(row.requested_time)} · {Number(row.duration_minutes??60)} min</small><small>{statusLabel(row.status)}</small></a>)}
              </div>
            </section>;
          })}
        </div></div>
      </section>
    </div>
    {dayCount<3?<section className="low-booking-reminder"><header><div><small>Automatic low-booking reminder</small><h2>Only {dayCount} confirmed appointment{dayCount===1?"":"s"} on this day</h2></div><a href="/admin/retention">Open full retention list →</a></header><p>Consider contacting clients who have not completed a visit for at least 120 days. Marketing SMS is only available where consent is recorded.</p><div>{reminderClients.map(client=><article key={String(client.id)}><strong>{String(client.full_name)}</strong><small>{client.last_visit?`Last visit ${new Date(String(client.last_visit)).toLocaleDateString("en-AU")}`:"No completed visit"}</small><span><a href={`/admin/clients/${client.id}`}>Profile</a><a href={`/admin/bookings?date=${date}&client=${client.id}#booking`}>Book</a></span>{client.marketing_sms_consent&&!client.sms_unsubscribed_at?<form action={queueReturnInviteAction}><input type="hidden" name="clientId" value={String(client.id)}/><input type="hidden" name="returnTo" value={`/admin/calendar?date=${date}`}/><button>Invite</button></form>:<em>Call only</em>}</article>)}</div></section>:null}
  </AdminShell>;
}
