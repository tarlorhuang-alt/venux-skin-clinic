"use client";

import { useEffect, useRef, useState } from "react";

type PayPalSession = {
  start: (options: { presentationMode: "auto" }, orderId: Promise<string>) => Promise<void>;
};

type PayPalInstance = {
  findEligibleMethods: (options: { currencyCode: string }) => Promise<{ isEligible: (method: string) => boolean }>;
  createPayPalOneTimePaymentSession: (options: {
    onApprove: (data: { orderId: string }) => Promise<void>;
    onCancel: () => void;
    onError: (error: unknown) => void;
  }) => PayPalSession;
};

declare global {
  interface Window {
    paypal?: {
      createInstance: (options: { clientToken: string; components: string[]; pageType: "checkout" }) => Promise<PayPalInstance>;
    };
  }
}

export function PayPalCheckout() {
  const container = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const [status, setStatus] = useState("Loading secure PayPal checkout…");
  const [complete, setComplete] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let paypalButton: HTMLElement | null = null;

    async function createOrder() {
      const response = await fetch("/api/paypal/orders", { method: "POST" });
      const order = await response.json();
      if (!response.ok || !order.id) throw new Error(order.error || "Unable to create order");
      return order.id as string;
    }

    async function start() {
      try {
        const tokenResponse = await fetch("/api/paypal/client-token", { cache: "no-store" });
        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok || !tokenData.clientToken) throw new Error(tokenData.error || "PayPal client token is unavailable");

        if (!window.paypal?.createInstance) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.paypal.com/web-sdk/v6/core"]');
            if (existing) {
              existing.addEventListener("load", () => resolve(), { once: true });
              existing.addEventListener("error", () => reject(new Error("PayPal Web SDK could not load")), { once: true });
              return;
            }
            const script = document.createElement("script");
            script.src = "https://www.paypal.com/web-sdk/v6/core";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("PayPal Web SDK could not load"));
            document.head.appendChild(script);
          });
        }

        if (cancelled || rendered.current || !container.current || !window.paypal?.createInstance) return;

        const sdk = await window.paypal.createInstance({
          clientToken: tokenData.clientToken,
          components: ["paypal-payments"],
          pageType: "checkout",
        });
        const methods = await sdk.findEligibleMethods({ currencyCode: "AUD" });
        if (!methods.isEligible("paypal")) throw new Error("PayPal is not eligible for this checkout");

        const session = sdk.createPayPalOneTimePaymentSession({
          onApprove: async ({ orderId }) => {
            setStatus("Confirming your payment…");
            const response = await fetch(`/api/paypal/orders/${encodeURIComponent(orderId)}/capture`, { method: "POST" });
            const order = await response.json();
            if (!response.ok || order.status !== "COMPLETED") throw new Error(order.error || "Payment was not completed");
            setComplete(orderId);
            setStatus("");
          },
          onCancel: () => setStatus("Payment cancelled. No charge was made."),
          onError: (error) => {
            console.error("[paypal-checkout] payment session error", error);
            setStatus("PayPal could not complete the payment. Please try again or contact the clinic.");
          },
        });

        paypalButton = document.createElement("paypal-button");
        paypalButton.setAttribute("type", "pay");
        paypalButton.setAttribute("aria-label", "Pay AUD $45 booking deposit with PayPal");
        paypalButton.addEventListener("click", async () => {
          setStatus("Opening secure PayPal checkout…");
          try {
            await session.start({ presentationMode: "auto" }, createOrder());
          } catch (error) {
            console.error("[paypal-checkout] unable to start", error);
            setStatus("PayPal could not start the payment. Please try again or contact the clinic.");
          }
        });

        container.current.replaceChildren(paypalButton);
        rendered.current = true;
        setStatus("");
      } catch (error) {
        console.error("[paypal-checkout] setup failed", error);
        if (!cancelled) setStatus("PayPal checkout is temporarily unavailable. Please contact the clinic or try again shortly.");
      }
    }

    start();
    return () => {
      cancelled = true;
      paypalButton?.remove();
    };
  }, []);

  if (complete) return <div className="paypal-success" role="status"><strong>Deposit received</strong><p>Your AUD $45 booking deposit has been paid. Reference: {complete}</p><a href="/book">Continue booking details ↗</a></div>;

  return <div className="paypal-checkout"><div ref={container} /><p role="status">{status}</p></div>;
}
