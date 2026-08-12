import type { Metadata } from "next";
import { Footer, Header, PageHero } from "../../site-chrome";
import { getPriceMap, resolvePrice } from "../../../lib/pricing";

export const metadata: Metadata = {
  title: "Professional Waxing & Laser Hair Removal | VenuX",
  description: "Compare VenuX professional waxing and laser hair removal prices by treatment area.",
};
export const dynamic = "force-dynamic";

const areas = [
  ["Upper lip", "$20", "$20"],
  ["Chin", "$20", "$20"],
  ["Eyebrow shaping", "$25", "Not treated"],
  ["Full face", "$65", "$65"],
  ["Underarms", "$25", "$25"],
  ["Standard bikini", "$30", "$30"],
  ["Brazilian", "$65", "$65"],
  ["Half arms", "$45", "$45"],
  ["Full arms", "$65", "$65"],
  ["Half legs", "$55", "$55"],
  ["Full legs", "$85", "$85"],
  ["Chest or back", "$75", "$75"],
  ["Full legs + Brazilian + underarms", "$155", "$155"],
] as const;

const questions = [
  ["Which option should I choose?", "Waxing removes hair from the root for an immediately smooth finish. Laser is designed for progressive hair reduction and requires a suitability assessment and a course of sessions."],
  ["How long should hair be before waxing?", "Hair generally needs enough length for the wax to grip. The clinic will provide preparation advice when your booking is confirmed."],
  ["Can I wax between laser sessions?", "Waxing is generally avoided during a laser course because laser requires hair in the follicle. Shaving guidance will be provided for your plan."],
  ["Can all skin and hair types have laser?", "Suitability depends on hair colour, skin tone, medication, sun exposure and treatment history. A consultation and patch test may be required."],
] as const;

export default async function HairRemovalPage() {
  const prices = await getPriceMap();
  const currentAreas = areas.map(([area, waxing, laser]) => {
    const waxNumber = Number(waxing.replace("$", ""));
    const wax = resolvePrice(prices, "Waxing", area, waxNumber, Math.round(waxNumber * 0.8));
    if (laser === "Not treated") return [area, `$${wax.regular}`, laser] as const;
    const laserNumber = Number(laser.replace("$", ""));
    const laserPrice = resolvePrice(prices, "Laser Hair Removal", area, laserNumber, Math.round(laserNumber * 0.8));
    return [area, `$${wax.regular}`, `$${laserPrice.regular}`] as const;
  });
  const currentWaxCourses = currentAreas.map(([area, waxing]) => {
    const single = Number(waxing.replace("$", ""));
    return [area, waxing, `$${single * 5}`] as const;
  }).filter(([area]) => area !== "Eyebrow shaping");
  return <main><Header />
    <PageHero kicker="Hair removal" title="Smooth skin." italic="Your choice of method." intro="Choose professional waxing for immediate smoothness or consultation-led laser hair removal for progressive reduction. VenuX uses the same single-session price for comparable areas." />

    <section className="treatment-product-hero waxing-visual supplied-waxing-visual">
      <img src="/waxing-clinic-hero.jpg" alt="Professional underarm waxing treatment" />
      <div className="waxing-visual-overlay"><p className="kicker light">Professional waxing</p><h2>Warm wax.<br />Precise technique.</h2><p>Performed with careful preparation, controlled application and considered aftercare for a polished clinic experience.</p><a className="button light-button" href="/book?treatment=Professional%20Waxing">Book waxing</a></div>
      <div className="waxing-location-ribbon"><article><span>01 · Top Ryde</span><strong>Shop 3002, Top Ryde City</strong><small>Ryde NSW 2112</small></article><article><span>02 · Sydney City</span><strong>515 Kent Street</strong><small>Sydney NSW 2000</small></article></div>
    </section>

    <section className="dual-price-section" id="prices">
      <div className="section-heading"><div><p className="kicker">Price by area</p><h2>Waxing and laser,<br />matched pricing.</h2></div><p>Single-session prices in AUD. Combination areas are available where listed. Laser suitability and recommended session count are confirmed before treatment.</p></div>
      <div className="dual-price-table" role="table" aria-label="Waxing and laser hair removal prices">
        <div className="dual-price-head" role="row"><strong>Treatment area</strong><strong>Waxing</strong><strong>Laser</strong></div>
        {currentAreas.map(([area,waxing,laser]) => <div className="dual-price-row" role="row" key={area}><span>{area}</span><strong>{waxing}</strong><strong>{laser}</strong></div>)}
      </div>
      <p className="price-note">Prices are current VenuX launch prices and may change. Laser is not performed over eyebrows or unsuitable areas. Final suitability and treatment area are confirmed by the clinic.</p>
      <div className="wax-course-block">
        <div className="sub-price-heading"><div><p className="kicker">Wax maintenance courses</p><h3>Single visit or six sessions.</h3></div><span>Prepaid course · same treatment area</span></div>
        <div className="wax-course-table" role="table" aria-label="Waxing single-session and six-session prices">
          <div className="wax-course-row wax-course-head" role="row"><strong>Waxing area</strong><strong>Single</strong><strong>6 sessions</strong></div>
          {currentWaxCourses.map(([area,single,course])=><div className="wax-course-row" role="row" key={area}><span>{area}</span><strong>{single}</strong><strong>{course}</strong></div>)}
        </div>
        <p className="price-note">Six-session launch packages include the sixth visit at no additional charge when five sessions are prepaid. Packages apply to the same area, are non-transferable and expire 12 months from purchase. Booking and cancellation conditions apply.</p>
      </div>
    </section>

    <section className="faq-section" id="questions">
      <div className="faq-intro"><p className="kicker">Question &amp; Answer</p><h2>Before your<br />appointment.</h2><p>Preparation differs between waxing and laser. Choose your method when booking and our team will send the correct instructions.</p></div>
      <div className="faq-list">{questions.map(([question,answer],index)=><details key={question}><summary><span>0{index+1}</span><strong>{question}</strong><span>＋</span></summary><p>{answer}</p></details>)}</div>
    </section>
    <Footer />
  </main>;
}
