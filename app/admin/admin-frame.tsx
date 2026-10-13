"use client";
import {useEffect,useState,type ReactNode} from "react";

const STORAGE_KEY="isa-navigation-collapsed";
export default function AdminFrame({sidebar,children}:{sidebar:ReactNode;children:ReactNode}){
  const [collapsed,setCollapsed]=useState(false);
  useEffect(()=>{
    try{
      const saved=localStorage.getItem(STORAGE_KEY);
      setCollapsed(saved===null?window.matchMedia('(max-width: 720px)').matches:saved==='true');
    }catch{setCollapsed(window.matchMedia('(max-width: 720px)').matches);}
  },[]);
  function toggle(){
    const next=!collapsed;
    setCollapsed(next);
    try{localStorage.setItem(STORAGE_KEY,String(next));}catch{}
  }
  return <main className={`clinic-admin${collapsed?' navigation-collapsed':''}`}>
    <aside className="clinic-sidebar" aria-label="Clinic navigation">
      <button type="button" className="navigation-toggle" onClick={toggle} aria-expanded={!collapsed} aria-controls="clinic-navigation" aria-label={collapsed?'Expand navigation':'Collapse navigation'} title={collapsed?'Expand navigation':'Collapse navigation'}><span aria-hidden="true">{collapsed?'☰':'‹'}</span><span className="navigation-toggle-label">Collapse menu</span></button>
      {sidebar}
    </aside>
    <div className="clinic-admin-main">{children}</div>
  </main>;
}
