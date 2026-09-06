import type { Metadata } from "next";
import {redirect} from "next/navigation";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import { AdminLogin } from "../admin-ui";
import "../admin.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Follow-ups | VenuX Clinic OS",robots:{index:false,follow:false}};

export default async function FollowupsPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;
  if(!(await isAdminAuthenticated()))return <AdminLogin error={params.error}/>;
  redirect("/admin/clients");
}
