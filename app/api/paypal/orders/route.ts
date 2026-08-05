import { NextResponse } from "next/server";
import { createDepositOrder } from "../../../../lib/paypal";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const order = await createDepositOrder();
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("PayPal order creation failed", error);
    return NextResponse.json({ error: "Unable to start PayPal checkout" }, { status: 500 });
  }
}
