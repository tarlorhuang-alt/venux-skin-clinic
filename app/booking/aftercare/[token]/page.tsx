import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAftercareByToken } from "../../../../lib/clinic-admin";
import { careSlug } from "../../../../lib/care-guides";
import CareGuide from "../../../care/[treatment]/[stage]/page";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Your after-care | ISA Skin Clinic",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function AppointmentAftercare({params}:{params:Promise<{token:string}>}){
  const booking=await getAftercareByToken((await params).token);
  if(!booking)notFound();
  // This separate link exposes care instructions only, never client health data.
  const treatment=careSlug(String(booking.treatment))||"general";
  return <CareGuide params={Promise.resolve({treatment,stage:"after"})}/>;
}
