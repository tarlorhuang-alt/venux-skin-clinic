"use client";

import {useMemo,useState} from "react";

type TreatmentOption={id:number;name:string;category:string;regularPrice:number};

export function TreatmentPicker({services}:{services:TreatmentOption[]}){
  const [query,setQuery]=useState(""),[serviceId,setServiceId]=useState(0),[price,setPrice]=useState(""),[open,setOpen]=useState(false);
  const matches=useMemo(()=>{const term=query.trim().toLowerCase();if(term.length<2)return [];return services.filter(service=>`${service.name} ${service.category}`.toLowerCase().includes(term)).slice(0,12);},[query,services]);
  const choose=(service:TreatmentOption)=>{setServiceId(service.id);setQuery(service.name);setPrice(String(service.regularPrice));setOpen(false);};
  return <div className="treatment-picker">
    <input type="hidden" name="serviceId" value={serviceId||""}/>
    <label>Treatment<div className="treatment-combobox"><input required value={query} onFocus={()=>{if(query.trim().length>=2)setOpen(true);}} onChange={event=>{setQuery(event.target.value);setServiceId(0);setOpen(event.target.value.trim().length>=2);}} autoComplete="off" role="combobox" aria-expanded={open} aria-controls="appointment-treatment-options" placeholder="Type treatment name"/>{open?<div className="treatment-options" id="appointment-treatment-options" role="listbox">{matches.length?matches.map(service=><button type="button" role="option" key={service.id} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(service)}><strong>{service.name}</strong><span>{service.category} · ${service.regularPrice.toLocaleString("en-AU")}</span></button>):<p>No matching treatment. Add it to the service catalogue first.</p>}</div>:null}</div></label>
    <label>Treatment price (AUD)<input name="totalAmount" type="number" min="0" step="0.01" value={price} onChange={event=>setPrice(event.target.value)} placeholder="Enter agreed price"/></label>
  </div>;
}
