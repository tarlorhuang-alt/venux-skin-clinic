"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {clearOwnerSession,createOwnerSession,isOwnerAuthenticated,ownerPasswordMatches} from "../../lib/owner-auth";
import {BookingConflictError,createBookingRequest,createCityStaff,createClinicService,finishAppointment,getOwnerService,importClientRows,importClinicServices,startAppointment,updateAppointment,type AppointmentStatus,type ClientImportRow,type ServiceImportRow} from "../../lib/clinic-admin";
import {PRICE_LIST_2026_SERVICES} from "../../lib/price-list-services";

const text=(data:FormData,name:string)=>String(data.get(name)??"").trim();
const ownerDate=(data:FormData)=>/^\d{4}-\d{2}-\d{2}$/.test(text(data,"date"))?text(data,"date"):"";

export async function ownerLogin(data:FormData){
  if(!ownerPasswordMatches(text(data,"password")))redirect("/owner?error=login");
  await createOwnerSession();redirect("/owner");
}

export async function ownerLogout(){await clearOwnerSession();redirect("/owner");}

async function requireOwner(){if(!(await isOwnerAuthenticated()))redirect("/owner?error=session");}

export async function addOwnerService(data:FormData){
  await requireOwner();const name=text(data,"name"),category=text(data,"category")||"Skin",duration=Number(data.get("duration")),price=Number(data.get("price")),memberRaw=text(data,"memberPrice"),memberPrice=memberRaw===""?null:Number(memberRaw),commissionPercent=Number(data.get("commissionPercent")??0),pricingType=text(data,"pricingType") as ServiceImportRow["pricingType"],unitLabel=text(data,"unitLabel"),notes=text(data,"notes");
  if(!name||!Number.isInteger(duration)||duration<5||duration>480||!Number.isFinite(price)||price<0||(memberPrice!==null&&(!Number.isFinite(memberPrice)||memberPrice<0))||!Number.isFinite(commissionPercent)||commissionPercent<0||commissionPercent>100||!["fixed","from","per_unit"].includes(pricingType??""))redirect("/owner?error=service");
  await createClinicService({name,category,duration,price,memberPrice,commissionPercent,pricingType,unitLabel,notes});revalidatePath("/owner");redirect("/owner?service=1");
}

function parseCsv(value:string){
  const parsed:string[][]=[];let row:string[]=[],cell="",quoted=false;for(let i=0;i<value.length;i++){const ch=value[i];if(ch==='"'){if(quoted&&value[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===","&&!quoted){row.push(cell);cell="";}else if((ch==="\n"||ch==="\r")&&!quoted){if(ch==="\r"&&value[i+1]==="\n")i++;row.push(cell);if(row.some(Boolean))parsed.push(row);row=[];cell="";}else cell+=ch;}row.push(cell);if(row.some(Boolean))parsed.push(row);if(parsed.length<2)return [];
  const headers=parsed[0].map(item=>item.replace(/^\uFEFF/,"").trim().toLowerCase());
  const index=(...names:string[])=>headers.findIndex(header=>names.includes(header));
  const ix={name:index("name","service","project"),category:index("category"),duration:index("duration","minutes","duration minutes"),price:index("price","regular price","standard"),member:index("member price","vip","vip price"),commission:index("commission","commission percent","commission %"),pricingType:index("pricing type"),unitLabel:index("unit","unit label"),notes:index("notes","price notes")};
  if(ix.name<0||ix.duration<0||ix.price<0)return [];
  return parsed.slice(1).map(columns=>{const memberRaw=ix.member>=0?(columns[ix.member]??"").trim():"";return {name:(columns[ix.name]??"").trim(),category:ix.category>=0?((columns[ix.category]??"").trim()||"Skin"):"Skin",duration:Number(columns[ix.duration]),price:Number(columns[ix.price]),memberPrice:memberRaw===""?null:Number(memberRaw),commissionPercent:ix.commission>=0?Number(columns[ix.commission]||0):0,pricingType:(ix.pricingType>=0?(columns[ix.pricingType]||"fixed"):"fixed") as ServiceImportRow["pricingType"],unitLabel:ix.unitLabel>=0?(columns[ix.unitLabel]??"").trim():"",notes:ix.notes>=0?(columns[ix.notes]??"").trim():""};}).filter(row=>Boolean(row.name)&&Number.isInteger(row.duration)&&row.duration>=5&&row.duration<=480&&Number.isFinite(row.price)&&row.price>=0&&(row.memberPrice===null||Number.isFinite(row.memberPrice))&&Number.isFinite(row.commissionPercent)&&Number(row.commissionPercent)>=0&&Number(row.commissionPercent)<=100&&["fixed","from","per_unit"].includes(row.pricingType??"")) as ServiceImportRow[];
}

export async function importBundledPriceList(){
  await requireOwner();const count=await importClinicServices(PRICE_LIST_2026_SERVICES);revalidatePath("/owner");revalidatePath("/admin/bookings");redirect(`/owner?imported=${count}`);
}

export async function importOwnerClients(data:FormData){
  await requireOwner();const file=data.get("clientFile");if(!(file instanceof File)||file.size===0||file.size>5_000_000)redirect("/owner?error=clients");
  const parseClientCsv=(value:string)=>{const rows:string[][]=[];let row:string[]=[],cell="",quoted=false;for(let i=0;i<value.length;i++){const ch=value[i];if(ch==='"'){if(quoted&&value[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===","&&!quoted){row.push(cell);cell="";}else if((ch==="\n"||ch==="\r")&&!quoted){if(ch==="\r"&&value[i+1]==="\n")i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell="";}else cell+=ch;}row.push(cell);if(row.some(Boolean))rows.push(row);return rows;};
  const parsed=parseClientCsv(await file.text());if(parsed.length<2||parsed.length>2001)redirect("/owner?error=clients");
  const headers=parsed[0].map(value=>value.replace(/^\uFEFF/,"").trim().toLowerCase());const index=(...names:string[])=>headers.findIndex(header=>names.includes(header));
  const indexes={group:index("group","customer group"),name:index("name","full name"),dob:index("dob","date of birth"),mobile:index("mobile","phone"),email:index("email","e-mail"),address:index("address")};
  if(indexes.name<0||indexes.mobile<0)redirect("/owner?error=client-columns");
  const isoDob=(value:string)=>{const clean=value.trim();if(!clean)return null;const au=clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(au)return `${au[3]}-${au[2].padStart(2,"0")}-${au[1].padStart(2,"0")}`;return /^\d{4}-\d{2}-\d{2}$/.test(clean)?clean:null;};
  const rows:ClientImportRow[]=parsed.slice(1).map(values=>({group:(values[indexes.group]??"General").trim()||"General",name:(values[indexes.name]??"").trim(),dob:indexes.dob>=0?isoDob(values[indexes.dob]??""):null,mobile:(values[indexes.mobile]??"").replace(/\s+/g,""),email:indexes.email>=0?(values[indexes.email]??"").trim().toLowerCase():"",address:indexes.address>=0?(values[indexes.address]??"").trim():""})).filter(row=>row.name&&row.mobile);
  if(!rows.length)redirect("/owner?error=clients");const result=await importClientRows(rows);revalidatePath("/owner");revalidatePath("/admin/clients");redirect(`/owner?clientsImported=${result.imported}&clientsProcessed=${result.processed}&clientDuplicates=${result.duplicates}`);
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
  if(!Number.isInteger(id)||id<=0||!date||!Number.isInteger(staffId)||staffId<=0||!Number.isFinite(amount)||amount<0||!["requested","confirmed","in_progress","completed","cancelled","no_show"].includes(status))redirect(`/owner?date=${date}&error=settlement`);
  await updateAppointment(id,status,amount,"paid",staffId);revalidatePath("/owner");redirect(`/owner?date=${date}&settled=1`);
}

export async function startCityAppointment(data:FormData){
  await requireOwner();const id=Number(data.get("id")),date=ownerDate(data),staffId=Number(data.get("staffId"));
  if(!Number.isInteger(id)||id<=0||!date||!Number.isInteger(staffId)||staffId<=0)redirect(`/owner?date=${date}&error=start`);
  const started=await startAppointment(id,staffId);revalidatePath("/owner");revalidatePath("/admin/bookings");revalidatePath("/admin/reports");redirect(`/owner?date=${date}&${started?"started=1":"error=start"}`);
}

export async function finishCityAppointment(data:FormData){
  await requireOwner();const id=Number(data.get("id")),date=ownerDate(data),staffId=Number(data.get("staffId"));
  if(!Number.isInteger(id)||id<=0||!date||!Number.isInteger(staffId)||staffId<=0)redirect(`/owner?date=${date}&error=finish`);
  const finished=await finishAppointment(id,staffId);revalidatePath("/owner");revalidatePath("/admin/bookings");revalidatePath("/admin/reports");revalidatePath("/admin/payroll");redirect(`/owner?date=${date}&${finished?"finished=1":"error=finish"}`);
}
