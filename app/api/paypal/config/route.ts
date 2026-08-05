import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "PayPal is not configured" }, { status: 503 });
  return NextResponse.json({ clientId, currency: "AUD", amount: "45.00" });
}
