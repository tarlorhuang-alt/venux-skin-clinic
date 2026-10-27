export type PaymentPart={method:string;amount:number};
export type ServiceAddOn={name:string;amount:number};
export type ServiceCheckout={membership:number;packageItemId:number|null;addOns:ServiceAddOn[];payments:PaymentPart[]};
export function moneyInput(value:unknown){
 const text=String(value??"").trim()||"0";
 if(!/^\d+(\.\d{1,2})?$/.test(text)||Number(text)>9999999)throw new Error("Enter a valid amount with no more than two decimal places.");
 return Number(text);
}
export function parseServiceCheckout(form:FormData):ServiceCheckout{
 const packageItemId=Number(form.get("packageItemId")||0);
 if(!Number.isSafeInteger(packageItemId)||packageItemId<0)throw new Error("Select an available package.");
 const addOns:ServiceAddOn[]=[];
 for(let i=0;i<8;i++){
  const name=String(form.get(`addOnName${i}`)??"").trim().slice(0,160),amount=moneyInput(form.get(`addOnAmount${i}`));
  if(amount&&!name)throw new Error("Enter a name for each add-on.");
  if(name)addOns.push({name,amount});
 }
 const payments=[['cash','Cash'],['card','Card'],['transfer','Bank transfer'],['other','Other']].map(([field,method])=>({method,amount:moneyInput(form.get(field))})).filter(part=>part.amount>0);
 return {membership:moneyInput(form.get('membershipUsed')),packageItemId:packageItemId||null,addOns,payments};
}
