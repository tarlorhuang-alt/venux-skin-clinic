"use client";

import {useEffect,useRef,useState} from "react";

type ClientSuggestion={id:number;name:string;mobile:string;email:string;membershipStatus:string;visitCount:number};

export function AppointmentClientPicker({initialClient}:{initialClient?:ClientSuggestion}){
  const [name,setName]=useState(initialClient?.name??""),[mobile,setMobile]=useState(initialClient?.mobile??""),[email,setEmail]=useState(initialClient?.email??""),[clientId,setClientId]=useState(initialClient?.id??0),[results,setResults]=useState<ClientSuggestion[]>([]),[open,setOpen]=useState(false),skipNext=useRef(false);
  useEffect(()=>{if(skipNext.current){skipNext.current=false;return;}const controller=new AbortController(),timer=window.setTimeout(async()=>{try{const response=await fetch(`/admin/api/clients/search?q=${encodeURIComponent(name.trim())}`,{signal:controller.signal,cache:"no-store"});if(!response.ok)return;const data=await response.json() as {clients:ClientSuggestion[]};setResults(data.clients);setOpen(true);}catch(error){if((error as Error).name!=="AbortError")setResults([]);}},250);return()=>{window.clearTimeout(timer);controller.abort();};},[name]);
  const choose=(client:ClientSuggestion)=>{skipNext.current=true;setClientId(client.id);setName(client.name);setMobile(client.mobile);setEmail(client.email);setResults([]);setOpen(false);};
  return <div className="appointment-client-picker">
    <input type="hidden" name="clientId" value={clientId||""}/>
    <label className="client-name-field">Client name<div className="client-combobox"><input name="name" required value={name} onFocus={()=>setOpen(true)} onChange={event=>{setName(event.target.value);if(clientId){setClientId(0);setMobile("");setEmail("");}}} autoComplete="off" role="combobox" aria-expanded={open} aria-controls="appointment-client-options" placeholder="Type to find an existing client"/>{open?<div className="client-options" id="appointment-client-options" role="listbox">{results.length?results.map(client=><button type="button" role="option" key={client.id} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(client)}><strong>{client.name}</strong><span>{client.mobile}{client.email?` · ${client.email}`:""}</span><small>{client.visitCount} appointments · {client.membershipStatus||"non-member"}</small></button>):name.trim()?<p>No matching client — a new profile will be created.</p>:<p>Start typing to search recent clients.</p>}</div>:null}</div></label>
    <label>Mobile<input name="mobile" required inputMode="tel" value={mobile} onChange={event=>setMobile(event.target.value)}/></label>
    <label>Email<input name="email" type="email" value={email} onChange={event=>setEmail(event.target.value)}/></label>
  </div>;
}
