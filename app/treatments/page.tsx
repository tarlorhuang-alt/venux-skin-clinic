import { Footer, Header, PageHero } from "../site-chrome";
import { services } from "../site-data";

const standards = [
  ["01", "Consultation first", "Your concerns, history and suitability are considered before treatment."],
  ["02", "Individual planning", "Recommendations are matched to your goals rather than a one-size-fits-all menu."],
  ["03", "Clear information", "Expected benefits, limitations, relevant risks and recovery are discussed before you proceed."],
  ["04", "Aftercare guidance", "Relevant preparation, home care and follow-up information supports your treatment journey."],
] as const;

const brands = [
  { name: "DMK", label: "Skin revision & enzyme therapy", description: "Professional protocols selected for structured skin revision plans and DMK Enzyme Therapy." },
  { name: "SkinCeuticals", label: "Corrective professional skin care", description: "Professional skincare incorporated into corrective facials and considered home-care recommendations." },
  { name: "Sothys Paris", label: "Hydration & barrier support", description: "French professional skincare used across hydrating, signature and barrier-support facial experiences." },
] as const;

const carePath = [
  ["Assess", "We begin with your concerns, skin history and current routine."],
  ["Treat", "Professional products and methods are selected for your individual treatment."],
  ["Maintain", "Where appropriate, we discuss a practical home-care plan to support your routine between visits."],
] as const;

const faqs = [
  ["How do I know which treatment is right for me?", "Start with a consultation. We review your concerns, history, current routine and goals before recommending an appropriate option."],
  ["What is the difference between the regular and member price?", "VenuX Membership begins with a prepaid balance from AUD $1,000 and includes 20% off all VenuX treatments. Visit the Membership page or ask our team before joining."],
  ["Can I book a popular treatment directly?", "Yes. You can select Book now from a popular treatment card. Suitability will still be confirmed before treatment."],
  ["Do I need a consultation before laser or aesthetic care?", "A consultation may be required depending on the treatment and your individual circumstances. Higher-risk procedures always require an appropriate professional assessment."],
  ["How should I prepare for my appointment?", "Preparation varies by treatment. After booking, the clinic will provide any relevant pre-care information for your selected service."],
  ["Are results the same for everyone?", "No. Results, recovery and the number of sessions required vary between individuals. Your practitioner will discuss realistic expectations with you."],
] as const;

const treatmentLinks: Record<string, string> = {
  "CO₂ Laser": "/treatments/laser-facial",
  "Lutronic Picosecond": "/treatments/lutronic-picosecond",
  "HIFU Focused Ultrasound": "/treatments/hifu-focused-ultrasound",
  "Laser & Light": "/treatments/ipl",
  "DMK Skin Revision": "/treatments/dmk-enzyme-therapy",
  "Enzyme Therapy": "/treatments/dmk-enzyme-therapy",
  "LED Light Therapy": "/treatments/led-light-therapy",
  "Ultherapy®": "/treatments/hifu-ultherapy",
  "Radiofrequency": "/treatments/rf-microneedling",
};

export default function Treatments() {
  return <main><Header />
    <PageHero kicker="Our treatment approach" title="Care designed" italic="around you." intro="Explore VenuX skin, body and aesthetic care by category or treatment method. Every recommendation begins with your history, concerns and goals." />

    <section className="standards-strip" aria-label="VenuX professional care standards">
      {standards.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
    </section>

    <section className="service-grid inner-grid treatment-category-grid">
      {services.map((service, index) => <article className="service-card" id={service.id} key={service.category}>
        <div className="service-number">0{index + 1}</div><p className="eyebrow">{service.eyebrow}</p>
        <h3>{service.category}</h3><p>{service.description}</p>
        <ul>{service.items.map(item => treatmentLinks[item]
          ? <li key={item}><a className="service-item-detail" href={treatmentLinks[item]}>{item}<span>↗</span></a></li>
          : <li key={item}>{item}<span>＋</span></li>)}</ul>
        <a className="text-link category-link" href={service.id === "skin" ? "/pricing" : "/book"}>
          {service.id === "skin" ? "View treatment prices" : "Request a consultation"} <span>↘</span>
        </a>
      </article>)}
    </section>

    <section className="brand-proof" id="brands">
      <div className="brand-proof-visual">
        <img src="/scientific-hero.png" alt="Scientific skincare concept in VenuX aqua tones" />
        <div className="visual-trust-note"><span>Professional care</span><strong>Selected for your skin</strong></div>
      </div>
      <div className="brand-proof-copy">
        <p className="kicker">Professional brands we use</p>
        <h2>Selected with<br /><i>purpose.</i></h2>
        <p className="brand-intro">We do not choose products simply because they are popular. Each professional product is considered in the context of your assessment, treatment and realistic home-care needs.</p>
        <div className="brand-list">
          {brands.map((brand, index) => <article key={brand.name}>
            <span>0{index + 1}</span><div><h3>{brand.name}</h3><em>{brand.label}</em></div><p>{brand.description}</p>
          </article>)}
        </div>
        <a className="button dark brand-book" href="/book">Book a skin consultation</a>
        <small>Product selection and suitability vary by individual. Brand availability may change.</small>
      </div>
    </section>

    <section className="care-path" aria-label="VenuX skin care pathway">
      <div><p className="kicker">Our approach</p><h2>Clinic care,<br /><i>connected.</i></h2></div>
      <div className="care-path-steps">
        {carePath.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}
      </div>
    </section>

    <section className="split-cta compact-cta"><h2>Not sure where<br />to begin?</h2><div><p>Start with a consultation and receive a recommendation based on your concerns and goals.</p><a className="button light-button" href="/book">Book a consultation</a></div></section>

    <section className="faq-section" id="questions">
      <div className="faq-intro"><p className="kicker">Question &amp; Answer</p><h2>Before you<br /><i>book.</i></h2><p>Helpful answers about choosing, booking and preparing for your VenuX treatment.</p></div>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => <details key={question}>
          <summary><span>0{index + 1}</span><strong>{question}</strong><i>＋</i></summary>
          <p>{answer}</p>
        </details>)}
      </div>
    </section>
    <Footer />
  </main>;
}
