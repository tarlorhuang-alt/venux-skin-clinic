/** One delivery per appointment schedule, including after a date/time change. */
export function reminderEventKey(id:number,date:string,time:string){
  return `appointment-24h:${id}:${date}:${time}`;
}

export function reminderMessage(name:string,treatment:string,date:string,time:string,token:string,siteUrl?:string){
  const base=(siteUrl||"https://venux-three.vercel.app").replace(/\/$/,"");
  const label=new Date(`${date}T12:00:00Z`).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric",timeZone:"Australia/Sydney"});
  return `ISA Skin Clinic: Hi ${name.trim().split(/\s+/)[0]}, your ${treatment} appointment is ${label} at ${time}. Please confirm, review pre-care and complete your skin questionnaire: ${base}/booking/confirm/${token}`;
}
