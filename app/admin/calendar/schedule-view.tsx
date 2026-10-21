"use client";
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from "react";
export default function ScheduleView({children,slotCount=61}:{children:ReactNode;slotCount?:number}){
 const [fit,setFit]=useState(true),[expanded,setExpanded]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 const [rowHeight,setRowHeight]=useState<number|null>(null);
 const restoreFocus=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  function measure(){
   const table=root.current?.querySelector('.reference-planner-scroll');
   if(!table)return;
   const heading=table.querySelector('.reference-beautician-heading');
   const available=Math.max(240,window.innerHeight-Math.max(12,table.getBoundingClientRect().top)-24);
   setRowHeight(Math.max(3,(available-(heading?.getBoundingClientRect().height??48))/slotCount));
  }
  const observer=new ResizeObserver(measure);if(root.current)observer.observe(root.current);
  window.addEventListener('resize',measure);measure();
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
 },[slotCount,expanded,fit]);
 useEffect(()=>{
  if(!expanded)return;
  const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setExpanded(false);restoreFocus.current?.focus();}};
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  document.addEventListener('keydown',close);
  return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',close);};
 },[expanded]);
 return <div ref={root} style={{"--schedule-row-height":fit&&rowHeight?`${rowHeight}px`:"30px"} as CSSProperties} className={`schedule-view${fit?' schedule-fit-columns schedule-fit-day':''}${expanded?' schedule-expanded':''}`}>
  <div className="schedule-view-toolbar"><span>Daily appointment table</span><div><button type="button" aria-pressed={fit} onClick={()=>setFit(!fit)}>{fit?'✓ Whole day · no scrolling':'Fit whole day'}</button><button type="button" ref={restoreFocus} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Close enlarged view':'Enlarge table'}</button></div></div>
  {children}
 </div>;
}
