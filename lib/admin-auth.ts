import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "venux_admin_session";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function passwordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!candidate || !expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createAdminSession() {
  const expires = Date.now() + 1000 * 60 * 60 * 8;
  const payload = String(expires);
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${signature(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    expires: new Date(expires),
  });
}

export async function isAdminAuthenticated() {
  if (!secret()) return false;
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const [payload, supplied] = value.split(".");
  if (!payload || !supplied || Number(payload) < Date.now()) return false;
  const expected = signature(payload);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}
