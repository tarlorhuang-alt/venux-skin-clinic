import ScheduleView from "./schedule-view";
import type {CSSProperties} from "react";
import {calendarTimeMinutes,calendarTimeLabel,beauticianColour,quarterHourSlots} from "../../../lib/calendar-schedule";
import "./calendar.css";
type Row=Record<string,unknown>;
export default function DaySchedule({rows,staff,date,entry="admin"}:{rows:Row[];staff:Row[];date:string;entry?:"admin"|"owner"}){
  const ROW_HEIGHT="var(--schedule-row-height,48px)";
  const visibleRows=rows.filter(row=>["confirmed","in_progress","completed"].includes(String(row.status)));
  const statusLabel=(status:unknown)=>String(status).replaceAll('_',' ');
  const appointmentUrl=(id:unknown)=>entry==="owner"?`/owner?date=${date}&appointment=${id}#city-appointment-${id}`:`/admin/bookings?date=${date}&appointment=${id}#appointment-${id}`;
  const newBookingUrl=(staffId:number,time?:string)=>entry==="owner"?`/owner?date=${date}${staffId?`&beautician=${staffId}`:""}${time?`&time=${encodeURIComponent(time)}`:""}#booking`:`/admin/bookings?date=${date}${staffId?`&staff=${staffId}`:""}${time?`&time=${encodeURIComponent(time)}`:""}#booking`;
  const columns=staff.filter(person=>person.active||visibleRows.some(row=>Number(row.staff_id)===Number(person.id))).map(person=>({id:Number(person.id),name:String(person.full_name)}));
  for(const row of visibleRows){
    const id=Number(row.staff_id??0);
    if(id&&!columns.some(person=>person.id===id))columns.push({id,name:String(row.staff_name||`Beautician #${id}`)});
  }
  if(visibleRows.some(row=>!row.staff_id)||!columns.length)columns.push({id:0,name:"Unassigned"});
  const columnPriority=(name:string)=>{const words=name.trim().toLowerCase().split(/\s+/);return words.includes("kary")?1:words.includes("tina")?2:0;};
  columns.sort((a,b)=>columnPriority(a.name)-columnPriority(b.name));
  const earliest=Math.min(540,...visibleRows.map(row=>calendarTimeMinutes(String(row.requested_time))).filter(time=>time<1440));
  const latest=Math.min(1425,Math.max(1260,...visibleRows.map(row=>calendarTimeMinutes(String(row.requested_time))+Number(row.duration_minutes??60)).filter(time=>time<1440)));
  const slots=quarterHourSlots(Math.floor(earliest/15)*15,Math.ceil(latest/15)*15);
  const start=slots[0];
  return (<ScheduleView slotCount={slots.length}><div className="shared-day-schedule"><section className="day-occupancy-overview" aria-label="Whole-day appointment overview"><header><strong>Whole-day overview</strong><small>Each bar is an appointment · select it to manage</small></header><div className="overview-hours"><span>Beautician</span><div>{[540,720,900,1080,1260].filter(minutes=>minutes>=start&&minutes<=start+slots.length*15).map(minutes=><time style={{left:`${(minutes-start)/(slots.length*15)*100}%`}} key={minutes}>{calendarTimeLabel(minutes)}</time>)}</div></div>{columns.map(person=>{
    const appointments=visibleRows.filter(row=>Number(row.staff_id??0)===person.id).sort((a,b)=>calendarTimeMinutes(String(a.requested_time))-calendarTimeMinutes(String(b.requested_time)));
    const ends:number[]=[];
    const positions=appointments.map(row=>{
      const minutes=calendarTimeMinutes(String(row.requested_time));
      let lane=ends.findIndex(end=>end<=minutes);if(lane<0)lane=ends.length;
      ends[lane]=minutes+Number(row.duration_minutes??60);return {row,lane};
    });
    return <div className="overview-person" key={person.id}><strong>{person.name}<small>{appointments.length} appointments</small></strong><div className="overview-day-track" style={{height:Math.max(34,ends.length*32+2)}}>{positions.map(({row,lane})=>{
      const minutes=calendarTimeMinutes(String(row.requested_time)),duration=Number(row.duration_minutes??60);
      return <a key={String(row.id)} href={appointmentUrl(row.id)} title={`${person.name} · ${row.full_name} · ${row.requested_time} · ${duration} min · ${row.treatment}`} aria-label={`${person.name}, ${row.full_name}, ${row.requested_time}, ${duration} minutes`} style={{top:lane*32+2,height:28,bottom:"auto",left:`${Math.max(0,(minutes-start)/(slots.length*15)*100)}%`,width:`${Math.min(100,duration/(slots.length*15)*100)}%`,background:person.id?beauticianColour(person.id):"#dce5e9"}}>{String(row.full_name)}</a>})}{!appointments.length?<small>No appointments</small>:null}</div><div className="overview-time-list">{appointments.map(row=><a key={String(row.id)} href={appointmentUrl(row.id)}>{String(row.requested_time)}–{calendarTimeLabel((calendarTimeMinutes(String(row.requested_time))+Number(row.duration_minutes??60))%1440)} · {String(row.full_name)}</a>)}</div></div>;
  })}</section><div className="reference-planner-scroll"><div className="reference-beautician-columns" style={{gridTemplateColumns:`repeat(${columns.length},minmax(var(--schedule-column-min,230px),1fr))`}}>
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
            const bookingUrl=(minutes:number)=>newBookingUrl(person.id,calendarTimeLabel(minutes));
            return <section className="reference-beautician-column" key={person.id} style={{"--beautician-colour":person.id?beauticianColour(person.id):"#dce5e9"} as CSSProperties} aria-label={`${person.name} appointments`}>
              <a className="reference-beautician-heading" href={newBookingUrl(person.id)}><strong>ISA Beauty · {person.name}</strong><small>{appointments.length} appointment{appointments.length===1?"":"s"}</small></a>
              <div className="reference-column-timeline" style={{height:`calc(${slots.length} * ${ROW_HEIGHT})`}}>
                {slots.map((minutes,index)=>{
                  const occupied=appointments.find(row=>calendarTimeMinutes(String(row.requested_time))<=minutes&&calendarTimeMinutes(String(row.requested_time))+Number(row.duration_minutes??60)>minutes);
                  const href=occupied?appointmentUrl(occupied.id):bookingUrl(minutes);
                  return <div className={`reference-quarter-row ${minutes%60===0?"hour-start":""}`} key={minutes} style={{top:`calc(${index} * ${ROW_HEIGHT})`,height:ROW_HEIGHT}}><a className="reference-time-label" href={href} aria-label={`${person.name}, ${calendarTimeLabel(minutes)}${occupied?', manage appointment':', new appointment'}`}><span className="schedule-full-time">{calendarTimeLabel(minutes)}</span><span className="schedule-quarter-time">{minutes%60===0?calendarTimeLabel(minutes):String(minutes%60)}</span></a><a className="reference-empty-slot" href={href} aria-label={`${occupied?'Manage appointment':'Book'} with ${person.name} at ${calendarTimeLabel(minutes)}`}/></div>;
                })}
                {positioned.map(({row,minutes,lane})=><a title={`${person.name} · ${row.full_name} · ${row.requested_time} · ${row.treatment}`} className={`reference-booking-block${Number(row.duration_minutes??60)<=30?" short-booking":""}`} href={appointmentUrl(row.id)} key={String(row.id)} style={{top:`calc(${(minutes-start)/15} * ${ROW_HEIGHT})`,height:`max(${ROW_HEIGHT},calc(${Number(row.duration_minutes??60)/15} * ${ROW_HEIGHT} - 1px))`,left:`calc(var(--schedule-time-width,68px) + (100% - var(--schedule-time-width,68px)) * ${lane/lanes})`,width:`calc((100% - var(--schedule-time-width,68px)) / ${lanes} - 4px)`}}><strong>{String(row.full_name)}</strong><span>{String(row.treatment)}</span><small>{String(row.requested_time)} · {Number(row.duration_minutes??60)} min</small><small>{statusLabel(row.status)}</small></a>)}
              </div>
            </section>;
          })}
        </div></div></div></ScheduleView>);
}
