import {NextResponse} from "next/server";
import {getAdminRole,isAdminAuthenticated} from "../../../../../../lib/admin-auth";
import {getAppointmentBeforePhoto,getAppointmentClinic} from "../../../../../../lib/clinic-admin";

export const dynamic="force-dynamic";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await isAdminAuthenticated()))return new NextResponse("Unauthorized",{status:401});
  const id=Number((await params).id);if(!Number.isInteger(id)||id<=0)return new NextResponse("Not found",{status:404});
  if((await getAdminRole())==="staff"&&!/top ryde/i.test(String(await getAppointmentClinic(id))))return new NextResponse("Forbidden",{status:403});
  const photo=await getAppointmentBeforePhoto(id),match=String(photo?.before_photo_data_url??"").match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if(!match)return new NextResponse("Before photo not found",{status:404});
  const filename=String(photo?.before_photo_name||`before-${id}.jpg`).replace(/[\r\n"\\]/g,"");
  return new NextResponse(new Uint8Array(Buffer.from(match[2],"base64")),{headers:{"Content-Type":match[1],"Cache-Control":"private, no-store","Content-Disposition":`inline; filename="${filename}"`}});
}
