import {NextResponse} from "next/server";
import {isAdminAuthenticated} from "../../../../../lib/admin-auth";
import {getClients} from "../../../../../lib/clinic-admin";

export const dynamic="force-dynamic";

export async function GET(request:Request){
  if(!(await isAdminAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const query=new URL(request.url).searchParams.get("q")?.trim().slice(0,80)??"",rows=await getClients(query);
  const clients=rows.slice(0,8).map(row=>({id:Number(row.id),name:String(row.full_name),mobile:String(row.mobile),email:String(row.email??""),membershipStatus:String(row.membership_status??"non-member"),visitCount:Number(row.visit_count??0)}));
  return NextResponse.json({clients},{headers:{"Cache-Control":"private, no-store"}});
}
