"use server";
import { redirect } from "next/navigation";
import { respondToBooking } from "../../../lib/clinic-admin";
export async function respondBookingAction(formData:FormData){const token=String(formData.get("token")??"");const response=String(formData.get("response")??"");if(!/^[A-Za-z0-9_-]{20,80}$/.test(token)||!["confirmed","change_requested"].includes(response))redirect("/booking/confirm/invalid");const ok=await respondToBooking(token,response as "confirmed"|"change_requested");redirect(`/booking/confirm/${token}?result=${ok?response:"invalid"}`)}
