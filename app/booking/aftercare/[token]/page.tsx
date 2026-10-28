import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAftercareByToken } from "../../../../lib/clinic-admin";
import { careSlugs } from "../../../../lib/care-guides";
import CareGuide from "../../../care/treatment-guide";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Your after-care | ISA Skin Clinic",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function AppointmentAftercare({params}:{params:Promise<{token:string}>}){
  const booking=await getAftercareByToken((await params).token);
  if(!booking)notFound();
  // This separate link exposes care instructions only, never client health data.
  const treatments=careSlugs(String(booking.treatment));
  return <>{treatments.map((treatment,index)=><CareGuide key={treatment} params={Promise.resolve({treatment,stage:"after"})} showUniversal={index===treatments.length-1}/>)}</>;
}
