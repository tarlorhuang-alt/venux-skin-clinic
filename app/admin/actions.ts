"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminSession, createAdminSession, isAdminAuthenticated, passwordMatches } from "../../lib/admin-auth";
import { saveMembership, updateAppointment, type AppointmentStatus } from "../../lib/clinic-admin";

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

