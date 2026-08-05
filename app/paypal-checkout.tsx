"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { paypal?: { Buttons: (options: Record<string, unknown>) => { render: (target: HTMLElement) => Promise<void> } } }
}

export function PayPalCheckout() {
  const container = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const [status, setStatus] = useState("Loading secure PayPal checkout…");
  const [complete, setComplete] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const configResponse = await fetch("/api/paypal/config", { cache: "no-store" });
        if (!configResponse.ok) throw new Error("PayPal setup pending");
        const config = await configResponse.json();

        if (!window.paypal) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.clientId)}&currency=AUD&intent=capture&components=buttons`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Unable to load PayPal"));
            document.head.appendChild(script);
          });
        }

        if (cancelled || rendered.current || !container.current || !window.paypal) return;
        rendered.current = true;
        setStatus("");
        await window.paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },
          createOrder: async () => {
            const response = await fetch("/api/paypal/orders", { method: "POST" });
            const order = await response.json();
            if (!response.ok || !order.id) throw new Error(order.error || "Unable to create order");
            return order.id;
          },
          onApprove: async (data: { orderID: string }) => {
            setStatus("Confirming your payment…");
            const response = await fetch(`/api/paypal/orders/${encodeURIComponent(data.orderID)}/capture`, { method: "POST" });
            const order = await response.json();
            if (!response.ok || order.status !== "COMPLETED") throw new Error(order.error || "Payment was not completed");
            setComplete(data.orderID);
            setStatus("");
          },
          onCancel: () => setStatus("Payment cancelled. No charge was made."),
          onError: () => setStatus("PayPal could not complete the payment. Please try again or contact the clinic."),
        }).render(container.current);
      } catch {
        if (!cancelled) setStatus("PayPal checkout is awaiting secure merchant activation.");
      }
    }

    start();
    return () => { cancelled = true; };
  }, []);

  if (complete) return <div className="paypal-success" role="status"><strong>Deposit received</strong><p>Your AUD $45 booking deposit has been paid. Reference: {complete}</p><a href="/book">Continue booking details ↗</a></div>;

  return <div className="paypal-checkout"><div ref={container} /><p role="status">{status}</p></div>;
}
