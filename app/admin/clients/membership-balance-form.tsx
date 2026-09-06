"use client";

type MembershipBalanceFormProps={
  action:(formData:FormData)=>void|Promise<void>;
  clientId:number;
  balance:number;
  status:string;
  existing:boolean;
  returnTo?:"record";
  className:string;
  compactLabels?:boolean;
};

export function MembershipBalanceForm({action,clientId,balance,status,existing,returnTo,className,compactLabels=false}:MembershipBalanceFormProps){
  return <form action={action} className={className} onSubmit={event=>{
    const nextBalance=Number(new FormData(event.currentTarget).get("balance")??0);
    if(existing&&nextBalance!==balance&&!window.confirm(`Update this member's card balance from $${balance.toFixed(2)} to $${nextBalance.toFixed(2)}?`))event.preventDefault();
  }}>
    <input type="hidden" name="clientId" value={String(clientId)}/>{returnTo?<input type="hidden" name="returnTo" value={returnTo}/>:null}
    <label>{compactLabels?<span>Card balance</span>:"Card balance (AUD)"}<input name="balance" type="number" min="0" step="0.01" defaultValue={balance} required/></label>
    <label>{compactLabels?<span>Membership</span>:"Membership status"}<select name="status" defaultValue={status}><option value="inactive">Inactive</option><option value="active">Active</option><option value="paused">Paused</option></select></label>
    <button type="submit">{existing?"Update membership card":"Create membership card"}</button>
  </form>;
}
