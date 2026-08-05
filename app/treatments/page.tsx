import { Footer, Header, PageHero } from "../site-chrome";
import { services } from "../site-data";

const brands = [
  ["DMK", "Professional skin revision protocols selected to suit individual skin needs."],
  ["SkinCeuticals", "修丽可 · Advanced professional skincare selected as part of considered treatment plans."],
  ["Sothys Paris", "French professional skincare used across personalised facial experiences."],
] as const;

const faqs = [
  ["How do I know which treatment is right for me?", "Start with a consultation. We review your concerns, history, current routine and goals before recommending an appropriate option."],
  ["What is the difference between the regular and member price?", "Member pricing is available to eligible VenuX members. You can view current inclusions on the Membership page or ask our team before booking."],
  ["Can I book a popular treatment directly?", "Yes. You can select Book now from a popular treatment card. Suitability will still be confirmed before treatment."],
  ["Do I need a consultation before laser or aesthetic care?", "A consultation may be required depending on the treatment and your individual circumstances. Higher-risk procedures always require an appropriate professional assessment."],
  ["How should I prepare for my appointment?", "Preparation varies by treatment. After booking, the clinic will provide any relevant pre-care information for your selected service."],
  ["Are results the same for everyone?", "No. Results, recovery and the number of sessions required vary between individuals. Your practitioner will discuss realistic expectations with you."],
] as const;

export default function Treatments() {
  return <main><Header />
    <PageHero kicker="Our treatment approach" title="Care designed" italic="around you." intro="Explore VenuX skin, body and aesthetic care by category or treatment method. Every recommendation begins with your history, concerns and goals." />
    <section className="service-grid inner-grid treatment-category-grid">
      {services.map((service, index) => <article className="service-card" id={service.id} key={service.category}>
        <div className="service-number">0{index + 1}</div><p className="eyebrow">{service.eyebrow}</p>
        <h3>{service.category}</h3><p>{service.description}</p>
        <ul>{service.items.map(item => <li key={item}>{item}<span>＋</span></li>)}</ul>
        <a className="text-link category-link" href={service.id === "skin" ? "/pricing" : "/book"}>
          {service.id === "skin" ? "View treatment prices" : "Request a consultation"} <span>↘</span>
        </a>
      </article>)}
    </section>

    <section className="brand-proof" id="brands">
      <div className="brand-proof-visual"><img src="/scientific-hero.png" alt="Scientific skincare concept in VenuX aqua tones" /></div>
      <div className="brand-proof-copy">
        <p className="kicker">Professional brands we use</p>
        <h2>Selected with<br /><i>purpose.</i></h2>
        <p className="brand-intro">We work with established professional skincare brands and select products according to your skin assessment, treatment and home-care needs.</p>
        <div className="brand-list">
          {brands.map(([name, description], index) => <article key={name}>
            <span>0{index + 1}</span><h3>{name}</h3><p>{description}</p>
          </article>)}
        </div>
        <small>Product selection and suitability vary by individual. Brand availability may change.</small>
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
