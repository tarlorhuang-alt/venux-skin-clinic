import {NextResponse} from "next/server";
import {saveWebsiteEnquiry} from "../../../lib/website-enquiries";
export async function POST(request:Request){
 try{
  const body=await request.json();
  const input={key:String(body.key??""),email:String(body.email??"").trim().toLowerCase(),mobile:String(body.mobile??"").trim(),location:String(body.location??"")};
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.key)||input.email.length>160||!/^\S+@\S+\.\S+$/.test(input.email)||input.mobile.length>30||!/^\+?[\d ()-]{8,30}$/.test(input.mobile)||!["Top Ryde","City"].includes(input.location)||body.contactConsent!==true)return NextResponse.json({error:"Please check your email, phone and contact permission."},{status:400});
  if(body.website)return NextResponse.json({ok:true});
  await saveWebsiteEnquiry(input);
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"We couldn’t save your details. Please try again."},{status:500});}
}
