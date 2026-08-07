import type { Metadata } from "next";
import Image from "next/image";
import { Footer, Header } from "../../site-chrome";
import "./ipl.css";

export const metadata: Metadata = {
  title: "IPL Skin Rejuvenation | VenuX Skin Clinic",
  description: "Explore IPL science, illustrative examples, confirmed area pricing and common questions in one page.",
};

const examples = [
  {
    title: "Tone, redness & texture",
    description: "Published result after 1 SR IPL, 1 DiamondPolar™ and 1 NanoFractional RF™ treatment.",
    before: "https://www.venusconcept.com/img/before_after/matt_mahlberg_before.jpg",
    after: "https://www.venusconcept.com/img/before_after/matt_mahlberg_after.jpg",
    courtesy: "Colorado Center for Dermatology · Matt Mahlberg, MD",
  },
  {
    title: "Dark spots & uneven texture",
    description: "Published result after 3 SR IPL, 3 DiamondPolar™ and 3 NanoFractional RF™ treatments.",
    before: "https://www.venusconcept.com/img/before_after/tribella_en_2_before_2.jpg",
    after: "https://www.venusconcept.com/img/before_after/tribella_en_2_after_33.jpg",
    courtesy: "Venus Concept",
  },
  {
    title: "Pigmentation & photo-damaged tone",
    description: "Published result after 3 SR IPL, 3 DiamondPolar™ and 3 NanoFractional RF™ treatments.",
    before: "https://www.venusconcept.com/img/before_after/tribella_en_3_before_2.jpg",
    after: "https://www.venusconcept.com/img/before_after/tribella_en_3after_2.jpg",
    courtesy: "Anderson Plastic Surgery & MedSpa · Robert G. Anderson, MD",
  },
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
      <div><a className="back-link" href="/treatments">← All treatments</a><p className="kicker">TriBella™ by Venus · IPL photorejuvenation</p><h1>Clearer tone.<br /><i>Considered care.</i></h1><p className="ipl-lead">Our IPL treatments are performed on the Venus Versa™ Pro—the platform behind TriBella™. This page focuses on IPL photorejuvenation, the tone-correcting step within the three-part TriBella™ protocol.</p><div className="hero-actions"><a className="button dark" href="/book">Book a consultation</a><a className="text-link" href="#illustration">Explore IPL <span>↓</span></a></div></div>
      <div className="ipl-visual"><div className="light-ring ring-one" /><div className="light-ring ring-two" /><Image className="ipl-device-image" src="/venus-ipl-device.jpg" alt="Black Venus Versa Pro treatment platform used for IPL and TriBella treatments at VenuX Skin Clinic" width={575} height={1200} priority sizes="(max-width: 800px) 100vw, 42vw" /><div className="ipl-device-label"><span>VENUS VERSA™ PRO</span><small>TriBella™ platform<br />IPL · RF · Resurfacing</small></div></div>
    </section>

    <nav className="ipl-anchor-nav" aria-label="IPL page sections"><a href="#illustration"><span>01</span>How IPL works</a><a href="#examples"><span>02</span>Examples</a><a href="#pricing"><span>03</span>Price list</a><a href="#questions"><span>04</span>Questions</a></nav>

    <section className="ipl-explainer" id="illustration">
      <div className="ipl-science-heading"><p className="kicker">01 · How IPL works</p><h2>Selected light.<br /><i>Selected targets.</i></h2><p className="science-intro">IPL is not a single-wavelength laser. Venus SmartPulse™ delivers filtered broad-spectrum light using practitioner-selected settings, with real-time cooling designed to support comfort.</p></div>
      <div className="ipl-pathway">
        <div className="skin-diagram" aria-label="Educational diagram showing filtered IPL light reaching pigment and blood vessels in the skin">
          <div className="ipl-flash"><span>FILTERED IPL</span><i/><i/><i/></div>
          <div className="skin-surface"><span>Skin surface</span></div>
          <div className="skin-epidermis"><b className="melanin-dot dot-one"/><b className="melanin-dot dot-two"/><b className="melanin-dot dot-three"/><span>Melanin</span></div>
          <div className="skin-dermis"><div className="vessel-line"/><span>Haemoglobin</span></div>
        </div>
        <div className="target-paths">
          <article><span>01 · BROWN</span><h3>Melanin</h3><p>Selected wavelengths are absorbed more strongly by superficial brown pigment. Treated spots may temporarily darken before gradually flaking or fading.</p></article>
          <article><span>02 · RED</span><h3>Haemoglobin</h3><p>Other selected wavelengths can be absorbed by haemoglobin within visible vessels, helping facial redness appear less noticeable over time.</p></article>
          <article><span>03 · RESPONSE</span><h3>Gradual change</h3><p>The skin response develops after treatment rather than instantly. Session numbers, intervals and settings are personalised following assessment.</p></article>
        </div>
        <aside className="science-safety"><strong>Why assessment matters</strong><p>IPL suitability depends on skin tone, pigment type, medications, medical history and recent sun exposure. Melasma and unexplained or changing pigmented lesions require careful assessment before cosmetic treatment.</p></aside>
      </div>
    </section>

    <section className="example-section" id="examples"><div className="section-heading"><div><p className="kicker">02 · Published Venus results</p><h2>Real patient<br /><i>examples.</i></h2></div><p>These before-and-after photographs are published by Venus Concept and credited to the listed Venus provider. They are external clinical examples—not VenuX patients—and individual responses vary.</p></div><div className="example-grid">{examples.map((example, index)=><article key={example.title}><a className="case-images" href="https://www.venusconcept.com/en-id/tribella-treatment.htm" target="_blank" rel="noreferrer" aria-label={`View the official Venus source for ${example.title}`}><figure><img src={example.before} alt={`Before treatment — ${example.title}`} /><figcaption>Before</figcaption></figure><figure><img src={example.after} alt={`After treatment — ${example.title}`} /><figcaption>After</figcaption></figure></a><small>0{index+1} · OFFICIAL VENUS CASE</small><h3>{example.title}</h3><p>{example.description}</p><p className="case-credit">Courtesy of {example.courtesy}</p></article>)}</div><p className="price-note">Source: Venus Concept TriBella™ results gallery. These patients were treated using the complete TriBella™ protocol, not IPL alone. Photographs are not VenuX patient results. Outcomes vary and are not guaranteed.</p></section>

    <section className="ipl-pricing" id="pricing"><div className="section-heading"><div><p className="kicker">03 · Confirmed price list</p><h2>Area-based<br /><i>pricing.</i></h2></div><p>Current VenuX IPL prices in AUD. Your practitioner will confirm suitability, the correct treatment area and the recommended plan before treatment.</p></div><div className="ipl-area-table" role="table" aria-label="IPL treatment areas and prices"><div className="ipl-area-row area-head" role="row"><span>Area</span><span>Common focus</span><span>Regular</span><span>Member</span></div>{areas.map(([area, focus, regular, member]) => <div className="ipl-area-row" role="row" key={area}><strong>{area}</strong><span>{focus}</span><span>{regular}</span><span>{member}</span></div>)}</div><p className="price-note">All prices are in Australian dollars. Spot-treatment prices start from the amount shown and vary with treatment size. A patch test may be recommended.</p></section>

    <section className="ipl-faq" id="questions"><div className="faq-intro"><p className="kicker">Questions & answers</p><h2>Before you<br /><i>begin.</i></h2><p>These answers are general information. Your consultation and treatment plan will be personalised to your skin and medical history.</p></div><div className="faq-list">{questions.map(([question, answer], index)=><details key={question}><summary><span>0{index+1}</span><strong>{question}</strong><i>＋</i></summary><p>{answer}</p></details>)}</div></section>

    <section className="split-cta"><h2>Is IPL right<br />for your skin?</h2><div><p>Start with a professional assessment. We will review your concern, skin history and goals before recommending treatment.</p><a className="button light-button" href="/book">Book an IPL consultation</a></div></section><Footer />
  </main>;
}
