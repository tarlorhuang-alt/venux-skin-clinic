import { NextResponse } from "next/server";
import { BookingConflictError,createBookingRequest } from "../../../lib/clinic-admin";

const allowedClinics = new Set(["Top Ryde · Shop 3002", "Sydney City · 515 Kent Street"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = {
      name: String(body.name ?? "").trim().slice(0,120),
      mobile: String(body.mobile ?? "").trim().slice(0,40),
      email: String(body.email ?? "").trim().toLowerCase().slice(0,160),
      treatment: String(body.interest ?? "").trim().slice(0,160),
      clinic: String(body.clinic ?? "").trim().slice(0,120),
      date: String(body.date ?? "").trim(),
      time: String(body.time ?? "").trim().slice(0,30),
      notes: String(body.message ?? "").trim().slice(0,2000),
      source:"website" as const,
      serviceSmsConsent:body.serviceSmsConsent==="yes",
      marketingSmsConsent:body.marketingSmsConsent==="yes",
    };
    if (!input.name || !input.mobile || !/^\S+@\S+\.\S+$/.test(input.email) || !input.treatment || !allowedClinics.has(input.clinic) || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !input.time) {
      return NextResponse.json({ error: "Please check the required booking details." }, { status: 400 });
    }
    const todaySydney = new Intl.DateTimeFormat("en-CA", { timeZone:"Australia/Sydney", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());
    if (input.date < todaySydney) return NextResponse.json({ error: "Please choose a future date." }, { status: 400 });
    const id = await createBookingRequest(input);
    return NextResponse.json({ ok: true, reference: `VX-${String(id).padStart(6, "0")}` });
  } catch (error) {
    if(error instanceof BookingConflictError)return NextResponse.json({error:"That clinic time has just been requested by another client. Please choose another time."},{status:409});
    console.error("Unable to save booking request", error);
    return NextResponse.json({ error: "We could not save this request. Please contact the clinic directly." }, { status: 500 });
  }
}
