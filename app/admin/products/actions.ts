"use server";
import {isAdminAuthenticated,isOwnerAuthenticated} from "../../../lib/admin-auth";
import {receiveDelivery,sellProduct} from "../../../lib/product-inventory";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
export async function receiveDeliveryAction(){
 if(!(await isOwnerAuthenticated()))redirect("/admin?error=restricted");
 try{await receiveDelivery();}catch{redirect("/admin/products?error=database");}
 revalidatePath("/admin/products");redirect("/admin/products?saved=received");
}
export async function sellProductAction(form:FormData){
 if(!(await isAdminAuthenticated()))redirect("/admin?error=session");
 const code=String(form.get("code")??""),quantity=Number(form.get("quantity")),price=String(form.get("price")??""),customer=String(form.get("customer")??"").trim(),method=String(form.get("method")??""),key=String(form.get("requestKey")??"");
 if(!code||!Number.isSafeInteger(quantity)||quantity<1||quantity>10000||!/^\d{1,7}(\.\d{1,2})?$/.test(price)||!customer||customer.length>200||!["Cash","Card","Bank transfer","Other"].includes(method)||!/^[-a-f0-9]{36}$/.test(key))redirect("/admin/products?error=invalid");
 let saved=false;try{saved=await sellProduct(code,quantity,Math.round(Number(price)*100),customer,method,key);}catch{redirect("/admin/products?error=sale");}
 revalidatePath("/admin/products");redirect(`/admin/products?${saved?"saved=sale":"error=stock"}`);
}
