"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminSession, createAdminSession, isAdminAuthenticated, passwordMatches } from "../../lib/admin-auth";
import { importClientRows, saveMembership, updateAppointment, type AppointmentStatus, type ClientImportRow } from "../../lib/clinic-admin";

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
  await updateAppointment(id,status,totalAmount,depositStatus);
  revalidatePath("/admin"); revalidatePath("/admin/bookings");
  redirect("/admin/bookings?saved=1");
}

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
