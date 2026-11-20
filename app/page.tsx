import "./retail-home.css";
import TechnologyCards from "./technology/technology-cards";
import HomeEnquiry from "./home-enquiry";
import "./home-enquiry.css";
import { Footer, Header } from "./site-chrome";
import { getPriceMap, resolvePrice } from "../lib/pricing";

export const dynamic = "force-dynamic";

const popularTreatments = [
  {
    number: "01", label: "Ultrasound lifting", name: "Ultherapy®", detail: "700 lines · full face + upper neck", priceGroup: "Ultherapy", priceName: "Full face + upper neck · approx. 700 lines", standard: 2700, member: 2160, memberLabel: "ISA member price · 20% off", route: "/treatments/hifu-ultherapy", booking: "Ultherapy 700 lines", image: "/ultherapy-700-lines-machine.jpg", imagePosition: "center center",
  },
  {
    number: "02", label: "Polynucleotide rejuvenation", name: "Rejuran®", detail: "2 ml · one session", priceGroup: "Rejuran", priceName: "2 ml · Single session", standard: 650, member: 553, memberLabel: "ISA member price · 15% off", route: "/treatments/rejuran", booking: "Rejuran 2ml", image: "/rejuran-brand-logo.png", imagePosition: "center center",
  },
  {
    number: "03", label: "Professional hair removal", name: "Waxing", detail: "Underarms · one session", priceGroup: "Waxing", priceName: "Underarms", standard: 25, member: 20, memberLabel: "ISA member price · 20% off", route: "/treatments/hair-removal", booking: "Professional Waxing", image: "/waxing-clinic-hero.jpg", imagePosition: "center center",
  },
] as const;

const locations = [
  {
    number: "01",
    name: "Top Ryde",
    label: "ISA Skin Clinic & Aesthetics",
    address: <>Shop 3002, Top Ryde City Shopping Centre<br />Devlin Street &amp; Blaxland Road<br />Ryde NSW 2112</>,
    map: "https://www.google.com/maps/search/?api=1&query=Shop+3002+Top+Ryde+City+Shopping+Centre+Ryde+NSW+2112",
    visual: "top-ryde",
  },
  {
    number: "02",
    name: "Sydney CBD",
    label: "ISA Aesthetics",
    address: <>515 Kent Street<br />Sydney NSW 2000</>,
    map: "https://www.google.com/maps/search/?api=1&query=515+Kent+Street+Sydney+NSW+2000",
    visual: "kent-street",
  },
];

export default async function Home() {
  const prices = await getPriceMap();
  const currentPopular = popularTreatments.map((treatment) => ({ ...treatment, price: resolvePrice(prices, treatment.priceGroup, treatment.priceName, treatment.standard, treatment.member) }));
  const ultherapyGuide = [
    ["Brow + eye · approx. 200 lines", 1250, 1000],
    ["Lower face + jawline · approx. 450 lines", 2200, 1760],
    ["Full face + upper neck · approx. 700 lines", 2700, 2160],
  ].map(([name, regular, member]) => resolvePrice(prices, "Ultherapy", String(name), Number(regular), Number(member)));
  return (
    <main className="isa-public-home">
      <Header />
      <section className="home-consultation-hero">
        <div className="poster-copy">
          <p className="campaign-eyebrow">SKIN · LASER · AESTHETICS</p>
          <h1>YOUR SKIN.<br /><span>YOUR<br />CONFIDENCE.</span></h1>
          <p>Your next chapter in skin starts here. Explore personalised treatments, clear pricing and professional care at our two Sydney clinics.</p>
          <div className="hero-actions">
            <a className="button dark" href="/book">Book a consultation</a>
            <a className="button outline-button" href="/treatments">View treatments</a>
          </div>
        </div>
        <HomeEnquiry />
      </section>

      <nav className="treatment-shortcuts" aria-label="Explore treatments"><a href="/treatments/facial-treatments"><span>01</span>SKIN TREATMENTS <b>→</b></a><a href="/treatments/hair-removal"><span>02</span>HAIR REMOVAL <b>→</b></a><a href="/technology/m22"><span>03</span>LASER & LIGHT <b>→</b></a><a href="/technology/morpheus8"><span>04</span>RF MICRONEEDLING <b>→</b></a></nav>
      <section className="home-pricing-banner"><p>YOUR NEXT TREATMENT, MADE SIMPLE.</p><a href="/pricing">Explore prices & membership →</a></section>
      <section className="principles"><span>01 · Personalised plans</span><span>02 · Considered care</span><span>03 · Natural-looking results</span></section>

      <section className="popular" id="popular">
        <div className="section-heading">
          <div><p className="kicker">Explore ISA</p><h2>FIND YOUR NEXT TREATMENT.</h2></div>
          <p>Ultherapy, Rejuran and professional waxing with clear single-session starting prices. Final suitability, treatment area and quotation are confirmed after assessment.</p>
        </div>
        <div className="popular-grid popular-photo-grid">
          {currentPopular.map((treatment) => <article className="popular-card popular-photo-card" key={treatment.number}>
            <a className="popular-product-photo supplied-photo" href={treatment.route} aria-label={`View ${treatment.name}`} style={{ backgroundPosition: treatment.imagePosition }}>
              <img src={treatment.image} alt={`${treatment.name} treatment visual`} /><span>{treatment.number}</span>
            </a>
            <div className="popular-card-copy">
              <span>{treatment.number} · {treatment.label}</span>
              <h3>{treatment.name}</h3>
              <em>{treatment.detail}</em>
              <p>Standard <strong>${treatment.price.regular.toLocaleString("en-AU")}</strong></p>
              <p>{treatment.memberLabel} <strong>${treatment.price.member.toLocaleString("en-AU")}</strong></p>
              <div className="popular-actions"><a href={treatment.route}>View details</a><a className="popular-book" href={`/book?treatment=${encodeURIComponent(treatment.booking)}`}>Book assessment ↗</a></div>
            </div>
          </article>)}
        </div>
        <div className="ultherapy-line-guide" aria-label="Popular Ultherapy treatment areas">
          <span>Popular Ultherapy areas</span>{ultherapyGuide.map((item) => <strong key={item.key}>{item.name} <b>${item.regular.toLocaleString("en-AU")}</b></strong>)}
        </div>
        <p className="popular-price-note">All prices are in AUD. Member pricing is labelled on each treatment. Ultherapy line counts are indicative planning guides; anatomy, coverage, actual lines, suitability and final quotation are confirmed after assessment.</p>
      </section>

    <TechnologyCards />
      <section className="concerns">
        <div className="concerns-heading"><p className="kicker light">Main concerns</p><h2>YOUR SKIN.<br /><span className="title-accent">YOUR GOALS.</span></h2><p>Explore common skin concerns, then book a consultation for a personalised recommendation.</p></div>
        <div className="concern-list">
          {["Dehydration & barrier support","Acne & congestion","Sensitivity & redness","Pigmentation & uneven tone","Fine lines & texture","Eye-area hydration"].map((item,index) =>
            <a href="/treatments" key={item}><span>0{index+1}</span><strong>{item}</strong><em>↗</em></a>)}
        </div>
      </section>

      <section className="locations-section" id="locations">
        <div className="locations-heading"><p className="kicker">Visit ISA</p><h2>TWO SYDNEY CLINICS.<br /><span className="title-accent">ONE ISA EXPERIENCE.</span></h2><p>Choose the clinic that is most convenient for your consultation or treatment.</p></div>
        <div className="location-grid environment-grid">
          {locations.map((location) => <article className="location-card environment-card" key={location.number}>
            <div className={`location-visual ${location.visual}`} role="img" aria-label={`${location.name} clinic location`}>
              <span>Visit ISA</span><strong>{location.name}</strong><small>Personalised skin & aesthetic care</small>
            </div>
            <div className="location-copy">
              <span>{location.number}</span><p>{location.label}</p><h3>{location.name}</h3><address>{location.address}</address>
              <div><a href={location.map} target="_blank" rel="noreferrer">Open in Maps ↗</a><a className="button dark" href="/book">Book here</a></div>
            </div>
          </article>)}
        </div>
      </section>
      <Footer />
    </main>
  );
}
