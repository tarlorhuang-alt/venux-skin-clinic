"use client";
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from "react";
export default function ScheduleView({children}:{children:ReactNode;slotCount?:number}){
 const [compact,setCompact]=useState(true),[expanded,setExpanded]=useState(false);
 const restoreFocus=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!expanded)return;
  const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setExpanded(false);restoreFocus.current?.focus();}};
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  document.addEventListener('keydown',close);
  return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',close);};
 },[expanded]);
 return <div style={{"--schedule-row-height":compact?"18px":"32px"} as CSSProperties} className={`schedule-view ${compact?'schedule-compact':'schedule-comfortable'}${expanded?' schedule-expanded':''}`}>
  <div className="schedule-view-toolbar"><span>Daily appointment table</span><div><button type="button" aria-pressed={compact} onClick={()=>setCompact(true)}>Compact appointments</button><button type="button" aria-pressed={!compact} onClick={()=>setCompact(false)}>Larger appointments</button><button type="button" ref={restoreFocus} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Close enlarged view':'Enlarge table'}</button></div></div>
  {children}
 </div>;
}
