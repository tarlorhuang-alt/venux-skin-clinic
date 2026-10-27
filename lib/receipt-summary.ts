export type ReceiptSnapshot={name:string;treatment:string;clinic:string;completedAt:string;total:number;deposit:number;membership:number;packageUsed:boolean;packageRemaining:number|null;paidNow:number;method:string;abn:string};
/** Package service value is not a new cash payment. */
export function receiptSummary(value:ReceiptSnapshot){
  const cents=(n:number)=>Math.round(Number(n)*100);
  const received=cents(value.deposit)+cents(value.paidNow);
  const balance=value.packageUsed?null:Math.max(0,cents(value.total)-received-cents(value.membership));
  return {received:received/100,balance:balance===null?null:balance/100};
}
