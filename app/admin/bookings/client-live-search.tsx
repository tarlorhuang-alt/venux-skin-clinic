"use client";

import {useEffect,useState} from "react";
import {usePathname,useRouter,useSearchParams} from "next/navigation";

export function ClientLiveSearch({initialValue}:{initialValue:string}){
  const [value,setValue]=useState(initialValue);const router=useRouter(),pathname=usePathname(),params=useSearchParams();
  const current=params.get("q")??"";
  useEffect(()=>{const clean=value.trim();if(clean===current)return;const timer=window.setTimeout(()=>{const next=new URLSearchParams(params.toString());if(clean)next.set("q",clean);else next.delete("q");next.delete("client");router.replace(`${pathname}?${next.toString()}`,{scroll:false});},300);return()=>window.clearTimeout(timer);},[value,current,pathname,router,params]);
  return <label>Type client name, mobile or email<input value={value} onChange={event=>setValue(event.target.value)} placeholder="Start typing a client name" inputMode="search" autoComplete="off"/></label>;
}
