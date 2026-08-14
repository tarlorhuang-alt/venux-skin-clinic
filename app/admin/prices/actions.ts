"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, isAdminAuthenticated, passwordMatches } from "../../../lib/admin-auth";
import { priceCatalogue, savePriceRows } from "../../../lib/pricing";

export async function login(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!passwordMatches(password)) redirect("/admin/prices?error=invalid-password");
  await createAdminSession();
  redirect("/admin/prices");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/prices");
}

export async function savePrices(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin/prices?error=session-expired");
  const rows = priceCatalogue.map((item) => {
    const regular = Number(formData.get(`${item.key}:regular`));
    const rate = Number(formData.get(`${item.key}:rate`));
    const manualMember = item.group === "DMK" ? Number(formData.get(`${item.key}:member`)) : undefined;
    return { key: item.key, regular, member: manualMember, memberRate: (rate === 85 ? 85 : 80) as 80 | 85 };
  });
  if (rows.some((row) => !Number.isInteger(row.regular) || row.regular < 0 || row.regular > 100000 || (row.member !== undefined && (!Number.isInteger(row.member) || row.member < 0 || row.member > 100000)))) {
    redirect("/admin/prices?error=invalid-price");
  }
  await savePriceRows(rows);
  revalidatePath("/", "layout");
  redirect("/admin/prices?saved=1");
}
