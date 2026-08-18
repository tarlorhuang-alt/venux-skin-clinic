"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {clearOwnerSession,createOwnerSession,isOwnerAuthenticated,ownerPasswordMatches} from "../../lib/owner-auth";
import {BookingConflictError,createBookingRequest,createCityStaff,createClinicService,getOwnerService,importClinicServices,updateAppointment,type AppointmentStatus,type ServiceImportRow} from "../../lib/clinic-admin";

const text=(data:FormData,name:string)=>String(data.get(name)??"").trim();
const ownerDate=(data:FormData)=>/^\d{4}-\d{2}-\d{2}$/.test(text(data,"date"))?text(data,"date"):"";

export async function ownerLogin(data:FormData){
  if(!ownerPasswordMatches(text(data,"password")))redirect("/owner?error=login");
  await createOwnerSession();redirect("/owner");
}

export async function ownerLogout(){await clearOwnerSession();redirect("/owner");}

async function requireOwner(){if(!(await isOwnerAuthenticated()))redirect("/owner?error=session");}

export async function addOwnerService(data:FormData){
  await requireOwner();const name=text(data,"name"),category=text(data,"category")||"Skin",duration=Number(data.get("duration")),price=Number(data.get("price"));
  if(!name||!Number.isInteger(duration)||duration<5||duration>480||!Number.isInteger(price)||price<0)redirect("/owner?error=service");
  await createClinicService({name,category,duration,price});revalidatePath("/owner");redirect("/owner?service=1");
}

function parseCsv(value:string){
  const lines=value.replace(/^\uFEFF/,"").split(/\r?\n/).filter(Boolean);if(lines.length<2)return [];
  const headers=lines[0].split(",").map(item=>item.trim().toLowerCase());
  const index=(...names:string[])=>headers.findIndex(header=>names.includes(header));
  const ix={name:index("name","service","project"),category:index("category"),duration:index("duration","minutes","duration minutes"),price:index("price","regular price")};
  if(ix.name<0||ix.duration<0||ix.price<0)return [];
  return lines.slice(1).map(line=>line.split(",").map(cell=>cell.trim())).map(columns=>({name:columns[ix.name]??"",category:ix.category>=0?(columns[ix.category]||"Skin"):"Skin",duration:Number(columns[ix.duration]),price:Number(columns[ix.price])})).filter((row):row is ServiceImportRow=>Boolean(row.name)&&Number.isInteger(row.duration)&&row.duration>=5&&row.duration<=480&&Number.isInteger(row.price)&&row.price>=0);
}

export async function importOwnerServices(data:FormData){
  await requireOwner();const file=data.get("serviceFile");if(!(file instanceof File)||file.size===0||file.size>1_000_000)redirect("/owner?error=import");
  const rows=parseCsv(await file.text());if(!rows.length||rows.length>500)redirect("/owner?error=import");
  const count=await importClinicServices(rows);revalidatePath("/owner");redirect(`/owner?imported=${count}`);
}

export async function addCityBeautician(data:FormData){
  await requireOwner();const name=text(data,"name"),role=text(data,"role")||"Beauty therapist";if(!name)redirect("/owner?error=staff");
  await createCityStaff(name,role);revalidatePath("/owner");redirect("/owner?staff=1");
}

export async function createCityAppointment(data:FormData){
  await requireOwner();const serviceId=Number(data.get("serviceId")),staffId=Number(data.get("staffId")),clientId=Number(data.get("clientId")??0),date=ownerDate(data),time=text(data,"time"),service=await getOwnerService(serviceId);
  if(!service||!Number.isInteger(staffId)||staffId<=0||!date||!time)redirect("/owner?error=booking");
  const input={clientId:clientId>0?clientId:undefined,staffId,serviceId,name:text(data,"name"),mobile:text(data,"mobile"),email:text(data,"email").toLowerCase(),treatment:String(service.service_name),clinic:"Sydney City · 515 Kent Street",date,time,durationMinutes:Number(service.duration_minutes),totalAmount:Number(service.regular_price),notes:text(data,"notes"),source:"admin" as const,serviceSmsConsent:data.get("serviceSmsConsent")==="yes"};
  if(!input.name||!input.mobile)redirect(`/owner?date=${date}&error=booking`);
  try{await createBookingRequest(input);}catch(error){if(error instanceof BookingConflictError)redirect(`/owner?date=${date}&error=conflict`);throw error;}
  revalidatePath("/owner");redirect(`/owner?date=${date}&booked=1`);
}

export async function settleCityAppointment(data:FormData){
  await requireOwner();const id=Number(data.get("id")),date=ownerDate(data),staffId=Number(data.get("staffId")),amount=Number(data.get("amount")),status=text(data,"status") as AppointmentStatus;
  if(!Number.isInteger(id)||id<=0||!date||!Number.isInteger(staffId)||staffId<=0||!Number.isInteger(amount)||amount<0||!["requested","confirmed","completed","cancelled","no_show"].includes(status))redirect(`/owner?date=${date}&error=settlement`);
  await updateAppointment(id,status,amount,"paid",staffId);revalidatePath("/owner");redirect(`/owner?date=${date}&settled=1`);
}
