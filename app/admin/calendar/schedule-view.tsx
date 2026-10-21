"use client";
import {useEffect,useRef,useState,type ReactNode} from "react";
export default function ScheduleView({children}:{children:ReactNode}){
 const [fit,setFit]=useState(true),[expanded,setExpanded]=useState(false);
 const restoreFocus=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!expanded)return;
  const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setExpanded(false);restoreFocus.current?.focus();}};
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  document.addEventListener('keydown',close);
  return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',close);};
 },[expanded]);
 return <div className={`schedule-view${fit?' schedule-fit-columns':''}${expanded?' schedule-expanded':''}`}>
  <div className="schedule-view-toolbar"><span>Daily appointment table</span><div><button type="button" aria-pressed={fit} onClick={()=>setFit(!fit)}>{fit?'✓ All columns':'Show all columns'}</button><button type="button" ref={restoreFocus} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Close enlarged view':'Enlarge table'}</button></div></div>
  {children}
 </div>;
}
