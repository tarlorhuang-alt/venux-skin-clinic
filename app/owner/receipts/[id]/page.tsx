import type {Metadata} from "next";
import {notFound,redirect} from "next/navigation";
import {isOwnerAuthenticated} from "../../../../lib/owner-auth";
import {getReceiptAppointment} from "../../../../lib/clinic-admin";
import {issueMissingCityReceipt} from "../../actions";
import MissingReceiptForm from "../../../admin/receipts/missing-receipt-form";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Create missing receipt | ISA",robots:{index:false,follow:false}};
export default async function MissingReceipt({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
 if(!(await isOwnerAuthenticated()))redirect('/owner');
 const id=Number((await params).id);if(!Number.isSafeInteger(id)||id<=0)notFound();
 const row=await getReceiptAppointment(id);if(!row)notFound();
 if(row.receipt_token)redirect(`/booking/receipt/${row.receipt_token}`);
 return <MissingReceiptForm row={row} error={(await searchParams).error} action={issueMissingCityReceipt} back="/owner"/>;
}
