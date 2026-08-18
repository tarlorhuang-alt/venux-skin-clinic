import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
import {cookies} from "next/headers";

const COOKIE_NAME="venux_owner_session";
const sessionSecret=()=>process.env.OWNER_SESSION_SECRET||"";
const signature=(payload:string)=>createHmac("sha256",sessionSecret()).update(payload).digest("base64url");

export function ownerPasswordMatches(candidate:string){
  const expected=process.env.OWNER_PASSWORD||"";
  if(!candidate||!expected)return false;
  const a=Buffer.from(candidate),b=Buffer.from(expected);
  return a.length===b.length&&timingSafeEqual(a,b);
}

export async function createOwnerSession(){
  const expires=Date.now()+1000*60*60*6,payload=String(expires),store=await cookies();
  store.set(COOKIE_NAME,`${payload}.${signature(payload)}`,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/owner",expires:new Date(expires)});
}

export async function isOwnerAuthenticated(){
  if(!sessionSecret())return false;
  const value=(await cookies()).get(COOKIE_NAME)?.value;if(!value)return false;
  const [payload,supplied]=value.split(".");if(!payload||!supplied||Number(payload)<Date.now())return false;
  const expected=signature(payload),a=Buffer.from(supplied),b=Buffer.from(expected);
  return a.length===b.length&&timingSafeEqual(a,b);
}

export async function clearOwnerSession(){(await cookies()).delete(COOKIE_NAME);}
