import { Footer, Header, PageHero } from "../site-chrome";
import { services } from "../site-data";

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
    <section className="split-cta"><h2>Not sure where<br />to begin?</h2><div><p>Start with a consultation. We will help you understand the appropriate options without pressure.</p><a className="button light-button" href="/book">Book a consultation</a></div></section>
    <Footer />
  </main>;
}
