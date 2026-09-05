"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, isOwnerAuthenticated, roleForPassword } from "../../../lib/admin-auth";
import { memberRates, type MemberRate, priceCatalogue, savePriceRows } from "../../../lib/pricing";

export async function login(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (roleForPassword(password)!=="owner") redirect("/admin/prices?error=invalid-password");
  await createAdminSession("owner");
  redirect("/admin/prices");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/prices");
}

export async function savePrices(formData: FormData) {
  if (!(await isOwnerAuthenticated())) redirect("/admin/prices?error=session-expired");
  const rows = priceCatalogue.map((item) => {
    const regular = Number(formData.get(`${item.key}:regular`));
    const rate = Number(formData.get(`${item.key}:rate`));
    const manualMember = item.group === "DMK" ? Number(formData.get(`${item.key}:member`)) : undefined;
    const memberRate = memberRates.includes(rate as MemberRate) ? rate as MemberRate : item.memberRate;
    return { key: item.key, regular, member: manualMember, memberRate };
  });
  if (rows.some((row) => !Number.isInteger(row.regular) || row.regular < 0 || row.regular > 100000 || (row.member !== undefined && (!Number.isInteger(row.member) || row.member < 0 || row.member > 100000)))) {
    redirect("/admin/prices?error=invalid-price");
  }
  await savePriceRows(rows);
  revalidatePath("/", "layout");
  redirect("/admin/prices?saved=1");
}
