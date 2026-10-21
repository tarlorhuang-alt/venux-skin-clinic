/** Transcribed service names from IMG_4304 / IMG_4306. No prices were supplied. */
export const IMAGE_SERVICE_NAMES=[
"10* laser PIH","12* Laser Toning","15min (face massage)","3* 1/2 legs laser hair remove","3* F/Arms laser hair removal","3* Laser Hair removal 1/2 Back","3* Laser hair remove (underarms)","3* laser hair remove Bikini","3* Laser Toning F/face","3* Paris Facial + BCN Serum Infusion","3* Skin booster (135HA + 532)","3* Skin Booster (532 +Placenta)","3* upper back + upper arms","30 min body massage + 30 min mini facial","30min (scalp massage)","4* Acne facial + Ampoule +LED (60min)","4* Eye Treatment","4* Mini facial + Polar","45min facial+45min massage","5* Mini facial+polar +5*laser toning","6* age-spot","6* hair laser (Bikini)","6* Hair laser removal (lip & chi)","6* laser hair removal (neck)","6* laser hair removal (Toes)","6* laser hair removal F/Face","6* Laser Pigment removal Full face","6* Mini facial","6* Polar +Mini facial (60mins)","6* Sothys facial +Polar","6*Laser Hair removal (Back $ Shoulder)","6+1 PIH (full face)","6+1 Sothys facial + Polar","@Consult","A-Communication & Photo","Acne Facial (Sothys)","Add on 15mins neck& shoulder massage","Add on Hair Shaving","Add on Hydra Peel","add on IPL","Add-on 30mins Massage","Add-on BCN Peel","Add-on Cool Mask","Add-on extraction","Add-on healing mask","Add-on Numbing Cream",
"Alkaline + body enzyme (stomach)","Alkaline + Enzyme (face)","Alkaline +Enzyme (Neck)","Alkaline wash","Alkaline wash (F/Arms)+Enzyme","Alkaline wash (feet)","Alkaline wash (Hands)","Alkaline Wash (legs)","Alkaline wash (spot)","Alkaline Wash (underarms)","Alkaline wash + body enzyme (back)","Alkaline Wash + Body enzyme 1/2 legs","Alkaline Wash + Enzyme (back 1/2 legs)","Alkaline wash +body Enzyme","Alkaline wash( face)","Alkaline wash(heel)","Alkaline wash(under arms)","Back Deep cleanse","Barrier Repair (infusion+Led+mask)","BCN Peel Treatment","Bikini & G-string Wax","body sculpting","Brow & Nose wax","Brow + lip & chin wax","Brow Wax & Lash Tinting","Brow Wax & Tinting","CGF","CGF + Skin Booster","Cheeks (men)","Christmas Angel","Closing","CO2 Laser Full Face","CO2 on back 1/2 legs","Day off","Deep cleanse + laser toning","Deep cleanse + LED","Deep cleanse +IPL","Deep cleanse facial","Diamond Polar","DMK 1","DMK 2","DMK 3","DMK 4","DMK Body","DMK body sculpting","DMK Business Meeting"
] as const;
export function imageServiceDuration(name:string){
 if(name==='30 min body massage + 30 min mini facial')return 60;
 if(name==='45min facial+45min massage')return 90;
 const explicit=name.match(/(\d+)\s*mins?\b/i);
 return explicit?Number(explicit[1]):60;
}
export function imageServiceCategory(name:string){
 if(/^(day off|closing|dmk business meeting|a-communication)/i.test(name))return 'Schedule / administration';
 if(/^add[ -]?on/i.test(name))return 'Add-ons';
 if(/alkaline|^dmk/i.test(name))return 'DMK / Alkaline';
 if(/hair|wax|cheeks/i.test(name))return 'Hair removal / Waxing';
 if(/laser|pih|ipl|co2|age.spot/i.test(name))return 'Laser / IPL';
 if(/massage/i.test(name))return 'Massage';
 if(/cgf|skin booster/i.test(name))return 'Skin boosters';
 return 'Facial / Skin treatments';
}
