"use client";
import type {ReactNode} from "react";
export default function AdminFrame({sidebar,children}:{sidebar:ReactNode;children:ReactNode}){
  return <main className="clinic-admin navigation-top">
    <header className="clinic-sidebar" aria-label="Clinic navigation">{sidebar}</header>
    <div className="clinic-admin-main">{children}</div>
  </main>;
}
