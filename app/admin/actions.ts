"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminSession, createAdminSession, isAdminAuthenticated, passwordMatches } from "../../lib/admin-auth";
import { BookingConflictError,completeFollowup,createBookingRequest,createClientCourse,createSkinAssessment,createTreatmentRecord,importClientRows,markSmsOutboxSent,queueBirthdayMessages,saveClientProfile,saveHealthProfile,saveMembership,updateAppointment,type AppointmentStatus,type ClientImportRow } from "../../lib/clinic-admin";

export async function adminLogin(formData: FormData) {
  if (!passwordMatches(String(formData.get("password") ?? ""))) redirect("/admin?error=login");
  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout() { await clearAdminSession(); redirect("/admin"); }

export async function changeAppointment(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin?error=session");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as AppointmentStatus;
  const totalAmount = Number(formData.get("totalAmount") ?? 0);
  const depositStatus = String(formData.get("depositStatus") ?? "unpaid");
  if (!Number.isInteger(id) || id <= 0 || !["requested","confirmed","completed","cancelled","no_show"].includes(status) || !Number.isInteger(totalAmount) || totalAmount < 0 || !["unpaid","paid","refunded","forfeited"].includes(depositStatus)) redirect("/admin/bookings?error=invalid");
  try{await updateAppointment(id,status,totalAmount,depositStatus);}catch(error){if(error instanceof BookingConflictError)redirect("/admin/bookings?error=conflict");throw error;}
  revalidatePath("/admin"); revalidatePath("/admin/bookings");
  redirect("/admin/bookings?saved=1");
}

export async function createAdminAppointment(formData:FormData){
  if(!(await isAdminAuthenticated()))redirect("/admin?error=session");
  const input={name:String(formData.get("name")??"").trim(),mobile:String(formData.get("mobile")??"").trim(),email:String(formData.get("email")??"").trim().toLowerCase(),treatment:String(formData.get("treatment")??"").trim(),clinic:String(formData.get("clinic")??"").trim(),date:String(formData.get("date")??"").trim(),time:String(formData.get("time")??"").trim(),notes:String(formData.get("notes")??"").trim(),source:"admin" as const,serviceSmsConsent:formData.get("serviceSmsConsent")==="yes",marketingSmsConsent:formData.get("marketingSmsConsent")==="yes"};
  if(!input.name||!input.mobile||!input.treatment||!input.clinic||!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!input.time)redirect("/admin/bookings?error=invalid");
  try{await createBookingRequest(input);}catch(error){if(error instanceof BookingConflictError)redirect("/admin/bookings?error=conflict");throw error;}
  revalidatePath("/admin");revalidatePath("/admin/bookings");redirect("/admin/bookings?created=1");
}

export async function markSmsSentAction(formData:FormData){
  if(!(await isAdminAuthenticated()))redirect("/admin?error=session");const id=Number(formData.get("id"));if(!Number.isInteger(id)||id<=0)redirect("/admin/messages?error=invalid");await markSmsOutboxSent(id);revalidatePath("/admin/messages");redirect("/admin/messages?saved=1");
}

export async function queueBirthdaysAction(){if(!(await isAdminAuthenticated()))redirect("/admin?error=session");const result=await queueBirthdayMessages();revalidatePath("/admin/messages");redirect(`/admin/messages?birthdays=${result.queued}`);}

export async function changeMembership(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin?error=session");
  const clientId = Number(formData.get("clientId"));
  const balance = Number(formData.get("balance"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(clientId) || clientId <= 0 || !Number.isInteger(balance) || balance < 0 || !["active","inactive","paused"].includes(status)) redirect("/admin/clients?error=invalid");
  await saveMembership(clientId,balance,status);
  revalidatePath("/admin"); revalidatePath("/admin/clients");
  redirect("/admin/clients?saved=1");
}

function parseCsv(text: string) {
  const rows:string[][]=[]; let row:string[]=[]; let cell=""; let quoted=false;
  for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){row.push(cell);cell="";}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell="";}else cell+=ch;}
  row.push(cell);if(row.some(Boolean))rows.push(row);return rows;
}

export async function importClients(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin?error=session");
  const file=formData.get("clientsFile");
  if(!(file instanceof File)||file.size===0||file.size>5_000_000) redirect("/admin/clients?error=file");
  const parsed=parseCsv(await file.text());
  if(parsed.length<2||parsed.length>2001) redirect("/admin/clients?error=file");
  const headers=parsed[0].map(v=>v.trim().toLowerCase());
  const index=(...names:string[])=>headers.findIndex(h=>names.includes(h));
  const indexes={group:index("group","customer group"),name:index("name","full name"),dob:index("dob","date of birth"),mobile:index("mobile","phone"),email:index("email","e-mail"),address:index("address")};
  if(indexes.name<0||indexes.mobile<0) redirect("/admin/clients?error=columns");
  const isoDob=(value:string)=>{const clean=value.trim();if(!clean)return null;const au=clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(au)return `${au[3]}-${au[2].padStart(2,"0")}-${au[1].padStart(2,"0")}`;return /^\d{4}-\d{2}-\d{2}$/.test(clean)?clean:null;};
  const rows:ClientImportRow[]=parsed.slice(1).map(values=>({group:(values[indexes.group]??"General").trim()||"General",name:(values[indexes.name]??"").trim(),dob:indexes.dob>=0?isoDob(values[indexes.dob]??""):null,mobile:(values[indexes.mobile]??"").replace(/\s+/g,""),email:indexes.email>=0?(values[indexes.email]??"").trim().toLowerCase():"",address:indexes.address>=0?(values[indexes.address]??"").trim():""})).filter(row=>row.name&&row.mobile);
  if(!rows.length) redirect("/admin/clients?error=file");
  const result=await importClientRows(rows);
  revalidatePath("/admin");revalidatePath("/admin/clients");
  redirect(`/admin/clients?imported=${result.imported}&processed=${result.processed}&duplicates=${result.duplicates}`);
}

const textValue=(formData:FormData,name:string)=>String(formData.get(name)??"").trim();
const positiveInt=(formData:FormData,name:string,nullable=false)=>{const raw=textValue(formData,name);if(!raw&&nullable)return null;const value=Number(raw);return Number.isFinite(value)&&value>=0?Math.round(value):null;};
const clientPath=(id:number)=>`/admin/clients/${id}`;

async function authorisedClient(formData:FormData){
  if(!(await isAdminAuthenticated())) redirect("/admin?error=session");
  const clientId=Number(formData.get("clientId"));
  if(!Number.isInteger(clientId)||clientId<=0) redirect("/admin/clients?error=invalid");
  return clientId;
}

export async function updateClientProfileAction(formData:FormData){
  const clientId=await authorisedClient(formData);
  const fullName=textValue(formData,"fullName"),mobile=textValue(formData,"mobile");
  if(!fullName||!mobile) redirect(`${clientPath(clientId)}?error=profile`);
  await saveClientProfile(clientId,{fullName,mobile,email:textValue(formData,"email").toLowerCase(),dob:textValue(formData,"dob"),address:textValue(formData,"address"),gender:textValue(formData,"gender"),occupation:textValue(formData,"occupation"),emergencyName:textValue(formData,"emergencyName"),emergencyPhone:textValue(formData,"emergencyPhone"),leadSource:textValue(formData,"leadSource")});
  revalidatePath(clientPath(clientId));revalidatePath("/admin/clients");redirect(`${clientPath(clientId)}?saved=profile`);
}

export async function updateHealthProfileAction(formData:FormData){
  const clientId=await authorisedClient(formData);
  await saveHealthProfile(clientId,{skinType:textValue(formData,"skinType"),primaryConcerns:textValue(formData,"primaryConcerns"),allergies:textValue(formData,"allergies"),medicalConditions:textValue(formData,"medicalConditions"),medications:textValue(formData,"medications"),pregnancyStatus:textValue(formData,"pregnancyStatus"),breastfeeding:formData.get("breastfeeding")==="yes",implants:textValue(formData,"implants"),aestheticHistory:textValue(formData,"aestheticHistory"),currentSkincare:textValue(formData,"currentSkincare")});
  revalidatePath(clientPath(clientId));redirect(`${clientPath(clientId)}?saved=health`);
}

export async function addSkinAssessmentAction(formData:FormData){
  const clientId=await authorisedClient(formData);
  const fitzpatrick=positiveInt(formData,"fitzpatrick",true),anxietyLevel=positiveInt(formData,"anxietyLevel",true),budget=positiveInt(formData,"budget",true);
  if((fitzpatrick!==null&&(fitzpatrick<1||fitzpatrick>6))||(anxietyLevel!==null&&(anxietyLevel<1||anxietyLevel>5))) redirect(`${clientPath(clientId)}?error=assessment`);
  await createSkinAssessment(clientId,{concerns:textValue(formData,"concerns"),mainConcern:textValue(formData,"mainConcern"),anxietyLevel,expectedOutcome:textValue(formData,"expectedOutcome"),fitzpatrick,recommendation:textValue(formData,"recommendation"),coursePlan:textValue(formData,"coursePlan"),budget,notes:textValue(formData,"notes"),assessedBy:textValue(formData,"assessedBy")||"Admin"});
  revalidatePath(clientPath(clientId));redirect(`${clientPath(clientId)}?saved=assessment`);
}

export async function addTreatmentRecordAction(formData:FormData){
  const clientId=await authorisedClient(formData);
  const service=textValue(formData,"service"),treatedAt=textValue(formData,"treatedAt"),operator=textValue(formData,"operator"),signature=textValue(formData,"signature");
  if(!service||!treatedAt||!operator||!signature) redirect(`${clientPath(clientId)}?error=treatment`);
  await createTreatmentRecord(clientId,{service,treatedAt,operator,area:textValue(formData,"area"),products:textValue(formData,"products"),brand:textValue(formData,"brand"),batchNumber:textValue(formData,"batchNumber"),dosage:textValue(formData,"dosage"),parameters:textValue(formData,"parameters"),shotCount:positiveInt(formData,"shotCount",true),unitCount:positiveInt(formData,"unitCount",true),treatmentMap:textValue(formData,"treatmentMap"),immediateResponse:textValue(formData,"immediateResponse"),adverseReaction:textValue(formData,"adverseReaction"),adverseManagement:textValue(formData,"adverseManagement"),signature});
  revalidatePath(clientPath(clientId));revalidatePath("/admin/follow-ups");redirect(`${clientPath(clientId)}?saved=treatment`);
}

export async function addClientCourseAction(formData:FormData){
  const clientId=await authorisedClient(formData);
  const purchased=positiveInt(formData,"purchased"),used=positiveInt(formData,"used"),amountPaid=positiveInt(formData,"amountPaid");
  if(!textValue(formData,"name")||purchased===null||purchased<1||used===null||used>purchased||amountPaid===null) redirect(`${clientPath(clientId)}?error=course`);
  await createClientCourse(clientId,{name:textValue(formData,"name"),purchased,used,expiresOn:textValue(formData,"expiresOn"),amountPaid,status:textValue(formData,"status")||"active"});
  revalidatePath(clientPath(clientId));redirect(`${clientPath(clientId)}?saved=course`);
}

export async function completeFollowupAction(formData:FormData){
  const clientId=await authorisedClient(formData),followupId=Number(formData.get("followupId"));
  const satisfaction=positiveInt(formData,"satisfaction",true);
  if(!Number.isInteger(followupId)||followupId<=0||(satisfaction!==null&&(satisfaction<1||satisfaction>5))) redirect(`${clientPath(clientId)}?error=followup`);
  await completeFollowup(followupId,clientId,{notes:textValue(formData,"notes"),satisfaction,abnormal:formData.get("abnormal")==="yes",reviewRequired:formData.get("reviewRequired")==="yes"});
  revalidatePath(clientPath(clientId));revalidatePath("/admin/follow-ups");redirect(`${clientPath(clientId)}?saved=followup`);
}
