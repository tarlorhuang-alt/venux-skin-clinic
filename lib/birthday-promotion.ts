export function birthdayPromotion(firstName:string,offer:string){
  const name=firstName.trim().split(/\s+/)[0]||"there";
  const promotion=offer.trim();
  if(!promotion)throw new Error("Enter the birthday offer and its validity first.");
  const body=`Happy birthday ${name}! From all of us at ISA Skin Clinic & Aesthetics: ${promotion} Contact the clinic to book and mention your birthday offer. Reply STOP to opt out.`;
  if(body.length>1000)throw new Error("The promotion is too long. Please shorten the offer.");
  return body;
}
