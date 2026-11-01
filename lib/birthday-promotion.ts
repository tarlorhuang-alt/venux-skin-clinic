export const birthdayPromotionOffers = [
  {id:"facial",label:"生日焕肤 · Facial 9 折",offer:"Enjoy 10% off one facial treatment during your birthday month. Valid once."},
  {id:"credit",label:"生日礼金 · 护理满 $200 减 $30",offer:"Enjoy $30 off a single treatment spend of $200 or more during your birthday month. No cash exchange. Cannot be combined with other offers."},
  {id:"friends",label:"双人同行 · 两人 Facial 各享 9 折",offer:"Celebrate with a friend: you both receive 10% off your facial treatments when you visit together on the same day during your birthday month."},
  {id:"mask",label:"护理升级 · Facial 赠补水面膜升级",offer:"Book a facial during your birthday month and receive a complimentary hydrating mask upgrade, subject to your therapist confirming suitability."},
  {id:"retail",label:"护肤礼遇 · 产品满 $150 减 $20",offer:"Enjoy $20 off a retail skincare purchase of $150 or more during your birthday month. Excludes professional-use products, gift sets and sale items."},
  {id:"return",label:"回店礼遇 · 赠下次护理 $20 券",offer:"Book a treatment during your birthday month and receive a $20 voucher for your next treatment spend of $150 or more. Voucher valid for 30 days from issue."},
] as const;

export function birthdayPromotion(firstName:string,offer:string){
  const name=firstName.trim().split(/\s+/)[0]||"there";
  const promotion=offer.trim();
  if(!promotion)throw new Error("Enter the birthday offer and its validity first.");
  const body=`Happy birthday ${name}! From all of us at ISA Skin Clinic & Aesthetics: ${promotion} Contact the clinic to book and mention your birthday offer. Reply STOP to opt out.`;
  if(body.length>1000)throw new Error("The promotion is too long. Please shorten the offer.");
  return body;
}
