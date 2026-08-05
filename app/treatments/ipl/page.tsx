import type { Metadata } from "next";
import { Footer, Header } from "../../site-chrome";
import "./ipl.css";

export const metadata: Metadata = {
  title: "IPL Skin Rejuvenation | VenuX Skin Clinic",
  description: "Learn how IPL works, which skin concerns it may address, treatment areas, pricing and what to expect.",
};

const concerns = [
  ["Pigmentation", "Freckles, sun spots and selected superficial pigmentation."],
  ["Visible redness", "Selected facial vessels, diffuse redness and rosacea-prone appearance."],
  ["Uneven tone", "Photo-damaged skin and a patchy or uneven-looking complexion."],
  ["Skin rejuvenation", "A brighter, more even appearance with minimal disruption to the skin surface."],
] as const;

const areas = [
  ["Full face", "Pigmentation, visible redness and overall tone", "$229", "$183"],
  ["Face + neck", "A broader treatment area for a more even transition", "$299", "$239"],
  ["Face + neck + décolletage", "Comprehensive treatment across commonly sun-exposed areas", "$369", "$299"],
  ["Décolletage", "Sun-related discolouration and visible redness", "$189", "$149"],
  ["Hands", "Visible sun spots and uneven-looking tone", "$129", "$99"],
  ["Spot treatment", "A small, practitioner-approved target area", "From $59", "From $49"],
] as const;

export default function IplTreatmentPage() {
  return <main><Header />
    <section className="ipl-hero">
      <div><a className="back-link" href="/treatments">← All treatments</a><p className="kicker">Light-based skin treatment · IPL</p><h1>Clearer tone.<br /><i>Considered care.</i></h1><p className="ipl-lead">Intense Pulsed Light uses carefully selected wavelengths of light to target visible pigment and redness. Every treatment begins with a skin assessment and personalised settings.</p><div className="hero-actions"><a className="button dark" href="/book">Book a consultation</a><a className="text-link" href="#pricing">View treatment areas <span>↓</span></a></div></div>
      <div className="ipl-visual" aria-hidden="true"><div className="light-ring ring-one" /><div className="light-ring ring-two" /><span>IPL</span><small>Broad-spectrum light<br />Personalised parameters</small></div>
    </section>

    <section className="ipl-explainer"><div><p className="kicker">01 · The science</p><h2>How IPL<br /><i>works.</i></h2></div><div className="ipl-copy"><p>IPL is different from a laser. Instead of emitting one wavelength, it delivers a spectrum of visible light. Filters and device settings allow the practitioner to direct light toward selected chromophores in the skin.</p><div className="science-steps"><article><span>01</span><h3>Light</h3><p>Controlled pulses pass through the skin surface.</p></article><article><span>02</span><h3>Target</h3><p>Melanin or haemoglobin absorbs selected light energy.</p></article><article><span>03</span><h3>Response</h3><p>The targeted pigment is heated and gradually processed by the body.</p></article></div></div></section>

    <section className="ipl-concerns"><div className="section-heading"><div><p className="kicker">02 · Suitable concerns</p><h2>What IPL may<br />help address.</h2></div><p>Suitability depends on your skin tone, medical history, medications, recent sun exposure and the type of pigmentation or redness present.</p></div><div className="concern-cards">{concerns.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>

    <section className="ipl-pricing" id="pricing"><div className="section-heading"><div><p className="kicker">03 · Treatment areas</p><h2>Area-based<br /><i>pricing.</i></h2></div><p>Current VenuX IPL prices in AUD. Your practitioner will confirm suitability, the recommended area and expected number of sessions before treatment.</p></div><div className="ipl-area-table" role="table" aria-label="IPL treatment areas and prices"><div className="ipl-area-row area-head" role="row"><span>Area</span><span>Common focus</span><span>Regular</span><span>Member</span></div>{areas.map(([area, focus, regular, member]) => <div className="ipl-area-row" role="row" key={area}><strong>{area}</strong><span>{focus}</span><span>{regular}</span><span>{member}</span></div>)}</div><p className="price-note">A patch test may be recommended. Final suitability, preparation and aftercare are confirmed during consultation. Spot-treatment prices start from the amount shown and vary with treatment size.</p></section>

    <section className="ipl-expect"><div><p className="kicker">04 · Your appointment</p><h2>What to<br />expect.</h2></div><div className="expect-grid"><article><h3>Before</h3><p>Avoid tanning and disclose medications, active skin conditions and recent procedures. Do not treat an unexplained or changing pigmented lesion without medical assessment.</p></article><article><h3>During</h3><p>Protective eyewear is worn. A cooling gel may be applied and light pulses can feel warm or similar to a light elastic-band snap.</p></article><article><h3>After</h3><p>Temporary redness or warmth can occur. Pigmented areas may darken before gradually flaking. Follow the personalised aftercare and daily sun protection advice.</p></article></div></section>

    <section className="split-cta"><h2>Is IPL right<br />for your skin?</h2><div><p>Start with a professional assessment. We will review your concern, skin history and goals before recommending treatment.</p><a className="button light-button" href="/book">Book an IPL consultation</a></div></section><Footer />
  </main>;
}
