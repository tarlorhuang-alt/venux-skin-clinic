import { NextResponse } from "next/server";
import { queueBirthdayMessages } from "../../../../lib/clinic-admin";
export const dynamic="force-dynamic";
export async function GET(request:Request){const secret=process.env.CRON_SECRET;if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return new NextResponse("Unauthorized",{status:401});const result=await queueBirthdayMessages();return NextResponse.json({ok:true,...result});}
