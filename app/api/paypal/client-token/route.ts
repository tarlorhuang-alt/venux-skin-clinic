import { NextResponse } from "next/server";
import { createBrowserSafeClientToken } from "../../../../lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clientToken = await createBrowserSafeClientToken();
    return NextResponse.json({ clientToken }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[api/paypal/client-token] failed", error);
    return NextResponse.json({ error: "PayPal checkout is temporarily unavailable" }, { status: 503 });
  }
}
