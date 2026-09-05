"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";

export function LiveClockStatus(){
  const router=useRouter(),[online,setOnline]=useState(true);
  useEffect(()=>{const update=()=>setOnline(navigator.onLine);update();window.addEventListener("online",update);window.addEventListener("offline",update);const timer=window.setInterval(()=>{if(navigator.onLine)router.refresh();},20000);return()=>{window.removeEventListener("online",update);window.removeEventListener("offline",update);window.clearInterval(timer);};},[router]);
  return <div className={`live-clock-status ${online?"online":"offline"}`} role="status"><i/>{online?"Live database connected · refreshes every 20 seconds":"Device offline · clock changes cannot sync"}</div>;
}
