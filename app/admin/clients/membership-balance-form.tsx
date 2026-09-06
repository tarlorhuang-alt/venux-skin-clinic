"use client";

type MembershipBalanceFormProps={
  action:(formData:FormData)=>void|Promise<void>;
  clientId:number;
  balance:number;
  existing:boolean;
  returnTo?:"record";
  className:string;
  compactLabels?:boolean;
};

export function MembershipBalanceForm({action,clientId,balance,existing,returnTo,className,compactLabels=false}:MembershipBalanceFormProps){
  return <form action={action} className={className} onSubmit={event=>{
    const amount=Number(new FormData(event.currentTarget).get("amount")??0);
    if(!window.confirm(existing?`Add $${amount.toFixed(2)} to this card? Current balance: $${balance.toFixed(2)}.`:`Create a Premium membership card with $${amount.toFixed(2)} balance?`))event.preventDefault();
  }}>
    <input type="hidden" name="clientId" value={String(clientId)}/>{returnTo?<input type="hidden" name="returnTo" value={returnTo}/>:null}
    <div className="membership-balance-readout"><span>Card balance</span><strong>${balance.toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
    <label>{compactLabels?<span>{existing?"Add funds":"Opening balance"}</span>:existing?"Recharge amount (AUD)":"Opening balance (AUD)"}<input name="amount" type="number" min="0" step="0.01" defaultValue="" placeholder="0.00" required/></label>
    <button type="submit">{existing?"Add funds":"Create Premium card"}</button>
  </form>;
}
