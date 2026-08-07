import type { Metadata } from "next";
import Image from "next/image";
import { Footer, Header } from "../../site-chrome";
import "./ipl.css";

export const metadata: Metadata = {
  title: "IPL Skin Rejuvenation | VenuX Skin Clinic",
  description: "Explore IPL science, illustrative examples, confirmed area pricing and common questions in one page.",
};

const examples = [
  ["Sun spots & freckles", "Selected superficial pigment may temporarily darken before gradually lifting from the skin.", "pigment"],
  ["Diffuse facial redness", "Selected light wavelengths can be absorbed by haemoglobin to reduce the appearance of visible redness.", "redness"],
  ["Uneven photo-damaged tone", "A considered treatment plan may help the complexion look clearer and more even over time.", "tone"],
] as const;

const areas = [
  ["Full face", "Pigmentation, visible redness and overall tone", "$229", "$183"],
  ["Face + neck", "A broader treatment area for a more even transition", "$299", "$239"],
  ["Face + neck + décolletage", "Comprehensive treatment across commonly sun-exposed areas", "$369", "$299"],
  ["Décolletage", "Sun-related discolouration and visible redness", "$189", "$149"],
  ["Hands", "Visible sun spots and uneven-looking tone", "$129", "$99"],
  ["Spot treatment", "A small, practitioner-approved target area", "From $59", "From $49"],
] as const;

const questions = [
  ["Is IPL the same as laser?", "No. IPL delivers a spectrum of visible light, while a laser typically uses a specific wavelength. Filters and personalised parameters help direct IPL toward selected pigment or redness."],
  ["Which concerns may be suitable?", "IPL may be considered for selected superficial pigmentation, freckles, sun spots, diffuse redness, visible vessels and uneven photo-damaged tone. Suitability must be assessed in person."],
  ["How many sessions will I need?", "The number and timing of sessions varies with the concern, treatment area, skin response, settings, sun exposure and goals. Your practitioner will recommend a plan after assessment."],
  ["Will pigment become darker afterwards?", "Selected pigmented areas can temporarily darken before gradually flaking or fading. Follow the personalised aftercare and sun-protection advice provided by the clinic."],
  ["Who may not be suitable?", "Recent tanning, certain medications, active skin conditions, some skin tones and unexplained or changing pigmented lesions may make treatment unsuitable or require medical assessment first."],
  ["Is a patch test required?", "A patch test may be recommended depending on your skin, treatment area, medical history and planned parameters."],
] as const;

export default function IplTreatmentPage() {
  return <main><Header />
    <section className="ipl-hero">
      <div><a className="back-link" href="/treatments">← All treatments</a><p className="kicker">Venus Versa™ · IPL photorejuvenation</p><h1>Clearer tone.<br /><i>Considered care.</i></h1><p className="ipl-lead">Our Venus Versa™ IPL platform uses carefully filtered pulses of light to address selected visible pigmentation and redness. Every treatment begins with a skin assessment and personalised device settings.</p><div className="hero-actions"><a className="button dark" href="/book">Book a consultation</a><a className="text-link" href="#illustration">Explore IPL <span>↓</span></a></div></div>
      <div className="ipl-visual"><div className="light-ring ring-one" /><div className="light-ring ring-two" /><Image className="ipl-device-image" src="/venus-ipl-device.jpg" alt="Venus IPL treatment platform used at VenuX Skin Clinic" width={733} height={1100} priority sizes="(max-width: 800px) 100vw, 42vw" /><div className="ipl-device-label"><span>VENUS VERSA™</span><small>SmartPulse™ IPL<br />Real-time cooling</small></div></div>
    </section>

    <nav className="ipl-anchor-nav" aria-label="IPL page sections"><a href="#illustration"><span>01</span>How IPL works</a><a href="#examples"><span>02</span>Examples</a><a href="#pricing"><span>03</span>Price list</a><a href="#questions"><span>04</span>Questions</a></nav>

    <section className="ipl-explainer" id="illustration"><div><p className="kicker">01 · Principle & illustration</p><h2>How IPL<br /><i>works.</i></h2></div><div className="ipl-copy"><p>Venus Versa™ IPL is different from a single-wavelength laser. SmartPulse™ technology delivers filtered broad-spectrum light with consistent pulse energy, while real-time cooling supports comfort during treatment. The selected applicator and settings direct light toward melanin or haemoglobin in the skin.</p><div className="science-steps"><article><span>01</span><div className="process-orb light-orb"/><h3>Filtered light</h3><p>Controlled pulses pass through the skin surface using personalised parameters.</p></article><article><span>02</span><div className="process-orb target-orb"/><h3>Selected target</h3><p>Melanin or haemoglobin absorbs selected light energy more strongly.</p></article><article><span>03</span><div className="process-orb response-orb"/><h3>Skin response</h3><p>The targeted pigment or redness may change gradually after treatment.</p></article></div><p className="price-note">This is an educational illustration and does not represent a guaranteed clinical result.</p></div></section>

    <section className="example-section" id="examples"><div className="section-heading"><div><p className="kicker">02 · Illustrative examples</p><h2>Concerns we<br /><i>may assess.</i></h2></div><p>IPL is not suitable for every pigment type or every skin tone. Consultation helps distinguish an appropriate cosmetic concern from a lesion requiring medical assessment.</p></div><div className="example-grid">{examples.map(([title, description, type], index)=><article key={title}><div className={`example-swatch ${type}`}><span>Illustrative pattern</span></div><small>0{index+1}</small><h3>{title}</h3><p>{description}</p></article>)}</div><p className="price-note">Illustrations are not patient before-and-after photographs. Responses vary and outcomes are not guaranteed.</p></section>

    <section className="ipl-pricing" id="pricing"><div className="section-heading"><div><p className="kicker">03 · Confirmed price list</p><h2>Area-based<br /><i>pricing.</i></h2></div><p>Current VenuX IPL prices in AUD. Your practitioner will confirm suitability, the correct treatment area and the recommended plan before treatment.</p></div><div className="ipl-area-table" role="table" aria-label="IPL treatment areas and prices"><div className="ipl-area-row area-head" role="row"><span>Area</span><span>Common focus</span><span>Regular</span><span>Member</span></div>{areas.map(([area, focus, regular, member]) => <div className="ipl-area-row" role="row" key={area}><strong>{area}</strong><span>{focus}</span><span>{regular}</span><span>{member}</span></div>)}</div><p className="price-note">All prices are in Australian dollars. Spot-treatment prices start from the amount shown and vary with treatment size. A patch test may be recommended.</p></section>

    <section className="ipl-faq" id="questions"><div className="faq-intro"><p className="kicker">Questions & answers</p><h2>Before you<br /><i>begin.</i></h2><p>These answers are general information. Your consultation and treatment plan will be personalised to your skin and medical history.</p></div><div className="faq-list">{questions.map(([question, answer], index)=><details key={question}><summary><span>0{index+1}</span><strong>{question}</strong><i>＋</i></summary><p>{answer}</p></details>)}</div></section>

    <section className="split-cta"><h2>Is IPL right<br />for your skin?</h2><div><p>Start with a professional assessment. We will review your concern, skin history and goals before recommending treatment.</p><a className="button light-button" href="/book">Book an IPL consultation</a></div></section><Footer />
  </main>;
}
