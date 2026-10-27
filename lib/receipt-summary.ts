export type ReceiptSnapshot={name:string;treatment:string;clinic:string;completedAt:string;total:number;deposit:number;membership:number;packageUsed:boolean;packageRemaining:number|null;paidNow:number;method:string;abn:string;packageCredit?:number;payments?:Array<{method:string;amount:number}>;addOns?:Array<{name:string;amount:number}>;accountTransactions?:Array<{type:string;amount:number;method:string}>};
/** Package service value is not a new cash payment. */
export function receiptSummary(value:ReceiptSnapshot){
  const cents=(n:number)=>Math.round(Number(n)*100);
  const received=cents(value.deposit)+cents(value.paidNow);
  const balance=value.packageUsed&&value.packageCredit===undefined?null:Math.max(0,cents(value.total)-received-cents(value.membership)-cents(value.packageCredit??0));
  return {received:received/100,balance:balance===null?null:balance/100};
}
