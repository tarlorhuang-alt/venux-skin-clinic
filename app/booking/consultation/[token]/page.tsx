import type { Metadata } from "next";
import { getConsultationByToken } from "../../../../lib/clinic-admin";
import { saveConsultationAction } from "../actions";
import "./consultation.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Pre-appointment skin update | ISA",robots:{index:false,follow:false}};
const value=(input:unknown)=>input===null||input===undefined?"":String(input);

export default async function ConsultationForm({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{saved?:string}>}){
  const token=(await params).token,saved=(await searchParams).saved==="1",booking=await getConsultationByToken(token);
  if(!booking)return <main className="consultation-page"><section className="consultation-card compact"><div className="consultation-brand">✦ ISA Skin Clinic &amp; Aesthetics</div><h1>This form is not available.</h1><p>Please contact the clinic if you need a new appointment link.</p></section></main>;
  const date=new Date(String(booking.requested_date)).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"Australia/Sydney"});
  if(saved)return <main className="consultation-page"><section className="consultation-card compact"><div className="consultation-brand">✦ ISA Skin Clinic &amp; Aesthetics</div><p className="consultation-kicker">Details received</p><h1>Thank you, {value(booking.full_name)}.</h1><p>Your recent skin, skincare and health information has been saved securely to your clinic profile for the team to review.</p><a className="consultation-button" href={`/booking/confirm/${token}`}>Review or confirm appointment</a></section></main>;
  return <main className="consultation-page"><section className="consultation-card"><header><div className="consultation-brand">✦ ISA Skin Clinic &amp; Aesthetics</div><p className="consultation-kicker">Pre-appointment update</p><h1>Your skin, recently.</h1><p>Please tell us about changes to your skin, products, health or medication. This supports consultation but does not replace an in-person suitability assessment.</p><dl><div><dt>Treatment</dt><dd>{value(booking.treatment)}</dd></div><div><dt>Appointment</dt><dd>{date} · {value(booking.requested_time)}</dd></div><div><dt>Clinic</dt><dd>{value(booking.clinic)}</dd></div></dl></header>
    <form action={saveConsultationAction}><input type="hidden" name="token" value={token}/>
      <label>Current skin type<select name="skinType" defaultValue={value(booking.skin_type)}><option value="">Select if known</option><option>Dry</option><option>Oily</option><option>Combination</option><option>Normal</option><option>Sensitive</option><option>Unsure</option></select></label>
      <label className="wide">What are your main skin concerns now?<textarea name="primaryConcerns" defaultValue={value(booking.primary_concerns)} placeholder="For example: sensitivity, breakouts, pigmentation, dryness or changes since your last visit"/></label>
      <label className="wide">Current skincare products and routine<textarea name="currentSkincare" defaultValue={value(booking.current_skincare)} placeholder="List cleansers, serums, active ingredients, prescription creams and recent changes"/></label>
      <label>Allergies or sensitivities<textarea name="allergies" defaultValue={value(booking.allergies)} placeholder="Write None if not applicable"/></label>
      <label>Medical conditions or recent health changes<textarea name="medicalConditions" defaultValue={value(booking.medical_conditions)} placeholder="Write None if not applicable"/></label>
      <label>Current medications and supplements<textarea name="medications" defaultValue={value(booking.medications)} placeholder="Include recent antibiotics, isotretinoin or topical prescriptions"/></label>
      <label>Pregnancy status<select name="pregnancyStatus" defaultValue={value(booking.pregnancy_status)}><option value="">Prefer not to say / not applicable</option><option>Not pregnant</option><option>Pregnant</option><option>Trying to conceive</option><option>Unsure</option></select></label>
      <label>Implants or medical devices<textarea name="implants" defaultValue={value(booking.implants)} placeholder="For example: pacemaker, metal or dental implants"/></label>
      <label>Recent aesthetic or skin treatments<textarea name="aestheticHistory" defaultValue={value(booking.aesthetic_history)} placeholder="Include treatment and approximate date"/></label>
      <label className="check"><input type="checkbox" name="breastfeeding" value="yes" defaultChecked={Boolean(booking.breastfeeding)}/><span>I am currently breastfeeding</span></label>
      <div className="form-note wide"><strong>Please tell your practitioner about any further changes on arrival.</strong><span>Information is stored in your private clinic record and used for consultation and treatment safety.</span></div>
      <button className="wide" type="submit">Save my update securely</button>
    </form>
  </section></main>;
}
