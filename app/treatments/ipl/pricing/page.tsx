import type { Metadata } from "next";
import { Footer, Header } from "../../../site-chrome";
import "../ipl.css";

export const metadata: Metadata = {
  title: "IPL Price List | VenuX Skin Clinic",
  description: "Current VenuX IPL treatment area pricing in AUD, including regular and member prices.",
};

const areas = [
  ["Full face", "Pigmentation, visible redness and overall tone", "$229", "$183"],
  ["Face + neck", "A broader treatment area for a more even transition", "$299", "$239"],
  ["Face + neck + décolletage", "Comprehensive treatment across commonly sun-exposed areas", "$369", "$299"],
  ["Décolletage", "Sun-related discolouration and visible redness", "$189", "$149"],
  ["Hands", "Visible sun spots and uneven-looking tone", "$129", "$99"],
  ["Spot treatment", "A small, practitioner-approved target area", "From $59", "From $49"],
] as const;

export default function IplPricingPage() {
  return <main><Header />
    <section className="price-page-hero"><a className="back-link" href="/treatments/ipl">← IPL overview</a><p className="kicker">Current IPL pricing · AUD</p><h1>IPL treatment<br /><i>price list.</i></h1><p>Pricing is organised by treatment area. A consultation and, when appropriate, a patch test are required before treatment.</p></section>

    <section className="ipl-pricing standalone-pricing"><div className="section-heading"><div><p className="kicker">Treatment areas</p><h2>Regular &<br /><i>member pricing.</i></h2></div><p>These are the VenuX IPL prices you previously confirmed. Your practitioner will confirm the correct area, suitability and recommended treatment plan.</p></div><div className="ipl-area-table" role="table" aria-label="IPL treatment areas and prices"><div className="ipl-area-row area-head" role="row"><span>Area</span><span>Common focus</span><span>Regular</span><span>Member</span></div>{areas.map(([area, focus, regular, member])=><div className="ipl-area-row" role="row" key={area}><strong>{area}</strong><span>{focus}</span><span>{regular}</span><span>{member}</span></div>)}</div><p className="price-note">All prices are in Australian dollars. Spot-treatment prices start from the amount shown and vary with treatment size. Final pricing is confirmed before treatment.</p></section>

    <section className="price-guidance"><article><span>01</span><h3>Consultation</h3><p>We review your concern, skin characteristics, medical history, medication and recent sun exposure.</p></article><article><span>02</span><h3>Patch testing</h3><p>A patch test may be recommended depending on the area, skin response and treatment parameters.</p></article><article><span>03</span><h3>Treatment plan</h3><p>The number and timing of sessions varies. No package or outcome is assumed from a single listed price.</p></article></section>

    <section className="split-cta"><h2>Ready to discuss<br />your skin?</h2><div><p>Book an assessment before choosing an IPL treatment area. Payment does not confirm treatment suitability.</p><a className="button light-button" href="/book">Book an IPL consultation</a></div></section>

    <section className="ipl-page-links"><a href="/treatments/ipl"><span>01</span><strong>IPL overview</strong><em>Science, suitability and appointment guidance ↗</em></a><a href="/treatments/ipl/examples"><span>02</span><strong>Illustrations & examples</strong><em>Visual treatment principles and example concerns ↗</em></a></section><Footer />
  </main>;
}
