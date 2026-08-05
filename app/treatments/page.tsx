import { Footer, Header, PageHero } from "../site-chrome";
import { services } from "../site-data";

export default function Treatments() {
  return <main><Header />
    <PageHero kicker="Our treatment approach" title="Care designed" italic="around you." intro="Explore VenuX treatment categories. Every recommendation begins with your skin history, concerns and goals." />
    <section className="service-grid inner-grid">
      {services.map((service, index) => <article className="service-card" key={service.category}>
        <div className="service-number">0{index + 1}</div><p className="eyebrow">{service.eyebrow}</p>
        <h3>{service.category}</h3><p>{service.description}</p>
        <ul>{service.items.map(item => <li key={item}>{item}<span>＋</span></li>)}</ul>
      </article>)}
    </section>
    <section className="split-cta"><h2>Not sure where<br />to begin?</h2><div><p>Start with a consultation. We will help you understand the options without pressure.</p><a className="button light-button" href="/book">Book a consultation</a></div></section>
    <Footer />
  </main>;
}
