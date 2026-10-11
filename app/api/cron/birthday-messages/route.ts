import { NextResponse } from "next/server";
import { queueAppointmentReminders,queueBirthdayMessages } from "../../../../lib/clinic-admin";
export const dynamic="force-dynamic";
export async function GET(request:Request){const secret=process.env.CRON_SECRET;if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return new NextResponse("Unauthorized",{status:401});const [birthdays,reminders]=await Promise.all([queueBirthdayMessages(),queueAppointmentReminders()]);return NextResponse.json({ok:true,birthdays,reminders});}
