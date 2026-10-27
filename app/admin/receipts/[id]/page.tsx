import type {Metadata} from "next";
import {notFound,redirect} from "next/navigation";
import {getAdminRole,isAdminAuthenticated} from "../../../../lib/admin-auth";
import {getReceiptAppointment} from "../../../../lib/clinic-admin";
import {AdminLogin} from "../../admin-ui";
import {issueMissingReceiptAction} from "../../actions";
import MissingReceiptForm from "../missing-receipt-form";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Create missing receipt | ISA",robots:{index:false,follow:false}};
export default async function MissingReceipt({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
 if(!(await isAdminAuthenticated()))return <AdminLogin/>;
 const id=Number((await params).id);if(!Number.isSafeInteger(id)||id<=0)notFound();
 const row=await getReceiptAppointment(id);if(!row||(await getAdminRole())==='staff'&&!/top ryde/i.test(String(row.clinic)))notFound();
 if(row.receipt_token)redirect(`/booking/receipt/${row.receipt_token}`);
 return <MissingReceiptForm row={row} error={(await searchParams).error} action={issueMissingReceiptAction} back="/admin/receipts"/>;
}
