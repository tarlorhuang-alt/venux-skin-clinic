import type { Metadata } from "next";
import Link from "next/link";
import {publishedAftercare} from "../../lib/published-aftercare";
import AftercareContent,{AftercareCommon} from "./aftercare-content";

const guides = {
  general: { title: "Treatment", before: ["Contact the clinic for preparation instructions for your specific treatment.", "Tell your practitioner about medications, allergies and recent changes to your health or skin."], after: ["Follow the individual after-care instructions provided by your treating practitioner.", "Contact the clinic if you are unsure which products or activities are appropriate after your treatment."] },
  facial: { title: "Facial", before: ["Tell your therapist about allergies, active skin irritation, recent treatments and medications.", "Avoid introducing new exfoliating products immediately before your visit."], after: ["Use a gentle cleanser and moisturiser.", "Wear broad-spectrum SPF 50+ and avoid irritating products if your skin feels sensitive."] },
  ipl: { title: "IPL", before: ["Tell the clinic about recent sun exposure, tanning, medications and any history of photosensitivity.", "Avoid tanning and arrive with clean skin; ask the clinic about any medicines or skincare that should be paused."], after: ["Protect the area from sunlight and use SPF 50+.", "Avoid picking at darkened spots, and avoid heat or harsh exfoliation while skin is recovering."] },
  "rf-microneedling": { title: "RF Microneedling", before: ["Tell your clinician about infections, pregnancy, medicines, allergies and recent procedures.", "Avoid tanning and ask which active skincare ingredients to pause."], after: ["Follow the clinician's instructions for cleansing and when to restart skincare or makeup.", "Avoid heat, vigorous exercise and active skincare until your clinician advises it is safe."] },
  microneedling: {title:"Mechanical Microneedling",before:["Tell your clinician about infections, medicines, allergies and recent procedures.","Ask which skincare products should be paused."],after:["Follow your clinician’s instructions for cleansing and restarting skincare or makeup.","Keep the treated area clean. Avoid heat, vigorous exercise and irritating products until your clinician advises it is safe."]},
  hifu: { title: "HIFU", before: ["Discuss prior fillers, implants, medical conditions and any recent procedures with your clinician.", "Arrive with clean skin and ask about any treatment-specific preparation."], after: ["Mild tenderness or swelling can occur; follow your clinician's advice.", "Use gentle skincare and sun protection."] },
  dmk: { title: "DMK Enzyme", before: ["Tell your therapist about sensitivity, allergies, recent exfoliation and any prescribed skincare.", "Avoid trying new strong active skincare just before treatment."], after: ["Use the prescribed home-care routine and keep skin moisturised.", "Avoid additional exfoliation until your therapist advises otherwise."] },
  prp: { title: "PRP", before: ["Tell your treating clinician about medicines, bleeding disorders, infections and relevant medical history.", "Follow any individual instructions about hydration, preparation and medicines; do not stop prescribed medication without medical advice."], after: ["Keep treated areas clean and follow the clinician's specific instructions.", "Avoid rubbing or applying irritating products until advised."] },
} as const;

type GuideKey = keyof typeof guides;
export function generateStaticParams() { return [...Object.keys(guides).flatMap(treatment => ["pre","after"].map(stage => ({ treatment, stage }))),...Object.keys(publishedAftercare).filter(treatment=>!(treatment in guides)).flatMap(treatment=>["pre","after"].map(stage=>({treatment,stage})))]; }
export async function generateMetadata({params}:{params:Promise<{treatment:string;stage:string}>}):Promise<Metadata>{
  const {treatment,stage}=await params;
  const guide=guides[treatment as GuideKey]??(publishedAftercare[treatment]?{title:publishedAftercare[treatment].title.replace(/\s+Aftercare$/i,""),before:guides.general.before,after:[]}:undefined);
  return {title:`${stage==="after"?publishedAftercare[treatment]?.title??`${guide?.title??"Skin"} Aftercare`:`${guide?.title??"Skin"} Pre-Care`} | ISA Skin Clinic`,robots:{index:false,follow:false}};
}
export default async function CareGuide({params,showUniversal=true}:{params:Promise<{treatment:string;stage:string}>;showUniversal?:boolean}){
  const {treatment,stage}=await params;
  const guide=guides[treatment as GuideKey]??(publishedAftercare[treatment]?{title:publishedAftercare[treatment].title.replace(/\s+Aftercare$/i,""),before:guides.general.before,after:[]}:undefined);
  if(stage==="after"&&publishedAftercare[treatment])return <AftercareContent guide={publishedAftercare[treatment]} showUniversal={showUniversal}/>;
  if(!guide || !["pre","after"].includes(stage)) return <main style={{padding:32}}>Guide not found. <Link href="/care">View guides</Link></main>;
  if(stage==="after")return <AftercareContent guide={{title:`${guide.title} Aftercare`,english:`${guide.title} Aftercare`,scope:"Follow the individual care plan provided by your treating clinician. The advice below is general and should be adapted to your treatment and recovery.",phases:[{time:"During recovery",title:"Follow your care plan",items:[...guide.after]}],urgent:["Contact the clinic promptly for severe or increasing pain, spreading redness, blistering, fever or other concerning symptoms. For a severe emergency, seek immediate medical care or call 000 in Australia."]}} showUniversal={showUniversal}/>;
  const before=stage==="pre";
  return <main style={{maxWidth:720,margin:"0 auto",padding:"48px 22px",fontFamily:"Arial,sans-serif",lineHeight:1.65}}>
    <p style={{letterSpacing:2,color:"#785b73"}}>ISA SKIN CLINIC & AESTHETICS</p>
    <h1>{guide.title} — {before?"Before Your Appointment":"After Your Treatment"}</h1>
    <p>{before?"Please review these general preparation tips before your visit.":"Please review these general recovery tips after your treatment."}</p>
    <ul>{(before?guide.before:guide.after).map(item=><li key={item} style={{marginBottom:12}}>{item}</li>)}</ul>
    <p><strong>Important:</strong> These are general instructions, not a substitute for your treating clinician's personalised advice. If you experience severe pain, spreading redness, blistering, fever, or any concerning symptoms, contact the clinic promptly. For urgent symptoms, seek immediate medical care.</p>
    {!before&&showUniversal?<AftercareCommon/>:null}
    <p>Questions? Please contact your clinic directly.</p>
    <Link href="/care">All care guides</Link>
  </main>;
}
