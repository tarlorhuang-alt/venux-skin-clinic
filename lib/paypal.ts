const PAYPAL_BASE_URL = "https://api-m.paypal.com";
const DEPOSIT_AMOUNT = "45.00";

function credentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials are not configured");
  return { clientId, clientSecret };
}

async function accessToken() {
  const { clientId, clientSecret } = credentials();
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to authenticate with PayPal");
  const data = await response.json();
  return data.access_token as string;
}

export async function createBrowserSafeClientToken() {
  const token = await accessToken();
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/identity/generate-token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Accept-Language": "en_AU",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || !data.client_token) throw new Error(data?.message || "Unable to generate PayPal client token");
  return data.client_token as string;
}

async function paypalRequest(path: string, init: RequestInit) {
  const token = await accessToken();
  const response = await fetch(`${PAYPAL_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "PayPal request failed");
  return data;
}

export function createDepositOrder() {
  return paypalRequest("/v2/checkout/orders", {
    method: "POST",
    headers: { "PayPal-Request-Id": crypto.randomUUID() },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        description: "VenuX consultation booking deposit",
        custom_id: "VENUX-BOOKING-DEPOSIT",
        amount: { currency_code: "AUD", value: DEPOSIT_AMOUNT },
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "VenuX Skin Clinic",
            locale: "en-AU",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
          },
        },
      },
    }),
  });
}

export function captureDepositOrder(orderId: string) {
  return paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { "PayPal-Request-Id": `${orderId}-capture` },
  });
}
