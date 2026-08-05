import { NextResponse } from "next/server";
import { captureDepositOrder } from "../../../../../../lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params;
  if (!/^[A-Z0-9]+$/i.test(orderId)) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  try {
    const order = await captureDepositOrder(orderId);
    return NextResponse.json(order);
  } catch (error) {
    console.error("PayPal capture failed", error);
    return NextResponse.json({ error: "Unable to complete PayPal payment" }, { status: 500 });
  }
}
