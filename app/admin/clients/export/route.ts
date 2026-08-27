import {isAdminAuthenticated} from "../../../../lib/admin-auth";
import {getClientExportRows} from "../../../../lib/clinic-admin";

export const dynamic="force-dynamic";
const csv=(value:unknown)=>`"${String(value??"").replaceAll('"','""')}"`;

export async function GET(){
  if(!(await isAdminAuthenticated()))return new Response("Unauthorized",{status:401});
  const rows=await getClientExportRows();
  const headers=["Client ID","Name","Mobile","Email","DOB","Address","Group","Clinic Location","Source","Membership","Card Balance","Membership Paid","Appointments","Last Visit"];
  const body=[headers.map(csv).join(","),...rows.map(row=>[row.id,row.full_name,row.mobile,row.email,row.dob,row.address,row.customer_group,row.clinic_location,row.lead_source,row.membership_status,row.membership_balance,row.membership_amount_paid,row.appointment_count,row.last_visit].map(csv).join(","))].join("\r\n");
  const date=new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  return new Response(`\uFEFF${body}`,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="venux-clients-${date}.csv"`,"Cache-Control":"private, no-store"}});
}
