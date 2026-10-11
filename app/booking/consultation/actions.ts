"use server";

import { redirect } from "next/navigation";
import { saveConsultationByToken } from "../../../lib/clinic-admin";

const clean=(data:FormData,name:string,max=1500)=>String(data.get(name)??"").trim().slice(0,max);

export async function saveConsultationAction(data:FormData){
  const token=clean(data,"token",100);
  if(!/^[A-Za-z0-9_-]{20,80}$/.test(token))redirect("/booking/consultation/invalid");
  const saved=await saveConsultationByToken(token,{
    skinType:clean(data,"skinType",120),
    primaryConcerns:clean(data,"primaryConcerns"),
    currentSkincare:clean(data,"currentSkincare"),
    allergies:clean(data,"allergies"),
    medicalConditions:clean(data,"medicalConditions"),
    medications:clean(data,"medications"),
    pregnancyStatus:clean(data,"pregnancyStatus",120),
    breastfeeding:data.get("breastfeeding")==="yes",
    implants:clean(data,"implants"),
    aestheticHistory:clean(data,"aestheticHistory"),
  });
  redirect(`/booking/consultation/${saved?token:"invalid"}?saved=${saved?"1":"0"}`);
}
