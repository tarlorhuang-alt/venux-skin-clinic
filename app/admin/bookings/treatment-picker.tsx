"use client";

import {useMemo,useState} from "react";

type TreatmentOption={id:number;name:string;category:string;regularPrice:number};
type VipTreatmentOption={id:0;name:"VIP";category:"VIP treatment";regularPrice:null};

const vipTreatment:VipTreatmentOption={id:0,name:"VIP",category:"VIP treatment",regularPrice:null};

export function TreatmentPicker({services}:{services:TreatmentOption[]}){
  const [query,setQuery]=useState(""),[serviceId,setServiceId]=useState(0),[price,setPrice]=useState(""),[open,setOpen]=useState(false);
  const matches=useMemo<(TreatmentOption|VipTreatmentOption)[]>(()=>{
    const term=query.trim().toLowerCase();
    if(!term)return [vipTreatment];
    if(term.length<2)return [];
    return [vipTreatment,...services]
      .filter(service=>`${service.name} ${service.category}`.toLowerCase().includes(term))
      .slice(0,12);
  },[query,services]);
  const choose=(service:TreatmentOption|VipTreatmentOption)=>{
    setServiceId(service.id);
    setQuery(service.name);
    setPrice(service.regularPrice===null?"":String(service.regularPrice));
    setOpen(false);
  };
  return <div className="treatment-picker">
    <input type="hidden" name="serviceId" value={serviceId||""}/>
    <label>Treatment<div className="treatment-combobox"><input name="treatment" required value={query} onFocus={()=>setOpen(true)} onChange={event=>{setQuery(event.target.value);setServiceId(0);setOpen(true);}} autoComplete="off" role="combobox" aria-expanded={open} aria-controls="appointment-treatment-options" placeholder="Search or type a new treatment"/>{open?<div className="treatment-options" id="appointment-treatment-options" role="listbox">{matches.length?matches.map(service=><button type="button" role="option" key={service.id||"vip"} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(service)}><strong>{service.name}</strong><span>{service.regularPrice===null?"VIP booking · enter the agreed price below":`${service.category} · $${service.regularPrice.toLocaleString("en-AU")}`}</span></button>):<button type="button" className="custom-treatment-option" onMouseDown={event=>event.preventDefault()} onClick={()=>setOpen(false)}><strong>Use “{query.trim()}” as a new treatment</strong><span>One-off booking · enter the agreed price below</span></button>}</div>:null}</div></label>
    <label>Treatment price (AUD)<input name="totalAmount" type="number" min="0" step="0.01" value={price} onChange={event=>setPrice(event.target.value)} placeholder="Enter agreed price"/></label>
  </div>;
}
