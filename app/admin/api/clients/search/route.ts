import {NextResponse} from "next/server";
import {getAdminRole,isAdminAuthenticated} from "../../../../../lib/admin-auth";
import {getClientsForBookingSearch} from "../../../../../lib/clinic-admin";

export const dynamic="force-dynamic";

export async function GET(request:Request){
  if(!(await isAdminAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const query=new URL(request.url).searchParams.get("q")?.trim().slice(0,80)??"",role=await getAdminRole(),rows=await getClientsForBookingSearch(query,role==="staff"?"Top Ryde":"");
    const clients=rows.slice(0,8).map(row=>({id:Number(row.id),name:String(row.full_name),mobile:String(row.mobile),email:String(row.email??""),clinicLocation:String(row.clinic_location??"Top Ryde"),membershipStatus:row.is_premium?"Premium client":"Standard client",visitCount:Number(row.visit_count??0)}));
    return NextResponse.json({clients},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){
    console.error("Booking client search failed",error);
    return NextResponse.json({error:"Client search is temporarily unavailable"},{status:500,headers:{"Cache-Control":"private, no-store"}});
  }
}
