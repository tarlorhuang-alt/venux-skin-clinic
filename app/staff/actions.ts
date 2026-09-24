"use server";

import {redirect} from "next/navigation";
import {createAdminSession,roleForPassword} from "../../lib/admin-auth";

export async function staffLogin(formData:FormData){
  if(roleForPassword(String(formData.get("password")??""))!=="staff")redirect("/staff?error=login");
  await createAdminSession("staff");
  redirect("/admin/bookings");
}
