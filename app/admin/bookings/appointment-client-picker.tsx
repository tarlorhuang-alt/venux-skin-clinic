"use client";

import {useEffect,useRef,useState} from "react";

type ClientSuggestion={id:number;name:string;mobile:string;email:string;clinicLocation:string;membershipStatus:string;visitCount:number};

export function AppointmentClientPicker({initialClient}:{initialClient?:ClientSuggestion}){
  const [name,setName]=useState(initialClient?.name??""),[mobile,setMobile]=useState(initialClient?.mobile??""),[email,setEmail]=useState(initialClient?.email??""),[clinicLocation,setClinicLocation]=useState(initialClient?.clinicLocation??""),[clientId,setClientId]=useState(initialClient?.id??0),[results,setResults]=useState<ClientSuggestion[]>([]),[open,setOpen]=useState(false),skipNext=useRef(false);
  useEffect(()=>{if(skipNext.current){skipNext.current=false;return;}const query=mobile.replace(/\D/g,"");if(query.length<3){setResults([]);setOpen(false);return;}const controller=new AbortController(),timer=window.setTimeout(async()=>{try{const response=await fetch(`/admin/api/clients/search?q=${encodeURIComponent(mobile.trim())}`,{signal:controller.signal,cache:"no-store"});if(!response.ok)return;const data=await response.json() as {clients:ClientSuggestion[]};setResults(data.clients);setOpen(true);}catch(error){if((error as Error).name!=="AbortError")setResults([]);}},250);return()=>{window.clearTimeout(timer);controller.abort();};},[mobile]);
  const choose=(client:ClientSuggestion)=>{skipNext.current=true;setClientId(client.id);setName(client.name);setMobile(client.mobile);setEmail(client.email);setClinicLocation(client.clinicLocation);setResults([]);setOpen(false);};
  return <div className="appointment-client-picker">
    <input type="hidden" name="clientId" value={clientId||""}/>
    <label>Client name<input name="name" required value={name} onChange={event=>{setName(event.target.value);if(clientId)setClientId(0);}} placeholder="Client name"/></label>
    <label className="client-mobile-field">Mobile<div className="client-combobox"><input name="mobile" required inputMode="tel" value={mobile} onFocus={()=>{if(mobile.replace(/\D/g,"").length>=3)setOpen(true);}} onChange={event=>{setMobile(event.target.value);if(clientId){setClientId(0);setName("");setEmail("");setClinicLocation("");}}} autoComplete="off" role="combobox" aria-expanded={open} aria-controls="appointment-client-options" placeholder="Type at least 3 digits"/>{clinicLocation?<em className={`selected-location clinic-location-badge ${clinicLocation==="City"?"city":"ryde"}`}>{clinicLocation}</em>:null}{open?<div className="client-options" id="appointment-client-options" role="listbox">{results.length?results.map(client=><button type="button" role="option" key={client.id} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(client)}><strong>{client.name}<em className={`clinic-location-badge ${client.clinicLocation==="City"?"city":"ryde"}`}>{client.clinicLocation}</em></strong><span>{client.mobile}{client.email?` · ${client.email}`:""}</span><small>{client.visitCount} appointments · {client.membershipStatus||"non-member"}</small></button>):<p>No client matches this phone number — a new profile will be created.</p>}</div>:null}</div></label>
    <label>Email<input name="email" type="email" value={email} onChange={event=>setEmail(event.target.value)}/></label>
  </div>;
}
