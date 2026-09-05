import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "venux_admin_session";
export type AdminRole = "owner" | "staff";
const DEFAULT_STAFF_PASSWORD_HASH = "4869bf74921453f4a47fe507213c7037b1795d3c14656f4641ad4f6a6740e78d";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(candidate: string, expected: string) {
  if (!candidate || !expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function roleForPassword(candidate: string): AdminRole | null {
  if (safeEqual(candidate, process.env.ADMIN_PASSWORD || "")) return "owner";
  const staffPassword = process.env.STAFF_PASSWORD || "";
  if (staffPassword && safeEqual(candidate, staffPassword)) return "staff";
  const digest = createHash("sha256").update(candidate).digest("hex");
  return safeEqual(digest, DEFAULT_STAFF_PASSWORD_HASH) ? "staff" : null;
}

export async function createAdminSession(role: AdminRole) {
  const expires = Date.now() + 1000 * 60 * 60 * 8;
  const payload = `${expires}:${role}`;
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
  return (await getAdminRole()) !== null;
}

export async function getAdminRole(): Promise<AdminRole | null> {
  if (!secret()) return null;
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return null;
  const [payload, supplied] = value.split(".");
  if (!payload || !supplied) return null;
  const [expires, role] = payload.split(":");
  if (Number(expires) < Date.now() || !["owner", "staff"].includes(role)) return null;
  const expected = signature(payload);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? role as AdminRole : null;
}

export async function isOwnerAuthenticated() { return (await getAdminRole()) === "owner"; }

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}
