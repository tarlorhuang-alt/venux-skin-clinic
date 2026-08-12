import { Footer, Header } from "./site-chrome";
import { getPriceMap, resolvePrice } from "../lib/pricing";

export const dynamic = "force-dynamic";

const popularTreatments = [
  {
    number: "01", label: "Ultrasound lifting", name: "Ultherapy®", detail: "700 lines · full face + upper neck", priceGroup: "Ultherapy", priceName: "Full face + upper neck · approx. 700 lines", standard: 2700, member: 2160, memberLabel: "VenuX member price · 20% off", route: "/treatments/hifu-ultherapy", booking: "Ultherapy 700 lines", image: "/ultherapy-700-lines-machine.jpg", imagePosition: "center center",
  },
  {
    number: "02", label: "Polynucleotide rejuvenation", name: "Rejuran®", detail: "2 ml · one session", priceGroup: "Rejuran", priceName: "2 ml · Single session", standard: 650, member: 553, memberLabel: "VenuX member price · 15% off", route: "/treatments/rejuran", booking: "Rejuran 2ml", image: "/rejuran-brand-logo.png", imagePosition: "center center",
  },
  {
    number: "03", label: "Professional hair removal", name: "Waxing", detail: "Underarms · one session", priceGroup: "Waxing", priceName: "Underarms", standard: 25, member: 20, memberLabel: "VenuX member price · 20% off", route: "/treatments/hair-removal", booking: "Professional Waxing", image: "/waxing-clinic-hero.jpg", imagePosition: "center center",
  },
] as const;

const locations = [
  {
    number: "01",
    name: "Top Ryde",
    label: "VenuX Skin Clinic",
    address: <>Shop 3002, Top Ryde City Shopping Centre<br />Devlin Street &amp; Blaxland Road<br />Ryde NSW 2112</>,
    map: "https://www.google.com/maps/search/?api=1&query=Shop+3002+Top+Ryde+City+Shopping+Centre+Ryde+NSW+2112",
    visual: "top-ryde",
  },
  {
    number: "02",
    name: "Sydney CBD",
    label: "VenuX Aesthetics",
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
    <main>
      <Header />
      <section className="poster-hero">
        <div className="poster-copy">
          <p className="kicker premium-kicker"><strong>VenuX Premium</strong> Skin &amp; Aesthetic Clinic</p>
          <h1>Natural Beauty,<br /><span className="title-accent">Refined by Science.</span></h1>
          <p>VenuX brings thoughtful skin care and aesthetic precision together through personalised, consultation-led treatment plans.</p>
          <div className="hero-actions">
            <a className="button dark" href="/book">Book a consultation</a>
            <a className="button outline-button" href="/treatments">View treatments</a>
          </div>
        </div>
        <div className="hero-promotion"><span>INTRODUCTORY OFFER</span><strong>50% OFF</strong><small>Selected first treatments · consultation and conditions apply</small><a href="/book?offer=50-percent">Claim offer ↗</a></div>
        <span className="poster-caption">Personalised care · Professional standards · Considered results</span>
      </section>

      <section className="principles"><span>01 · Personalised plans</span><span>02 · Considered care</span><span>03 · Natural-looking results</span></section>

      <section className="popular" id="popular">
        <div className="section-heading">
          <div><p className="kicker">Most requested</p><h2>Popular treatments.</h2></div>
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

      <section className="concerns">
        <div className="concerns-heading"><p className="kicker light">Main concerns</p><h2>Start with what<br /><span className="title-accent">matters to you.</span></h2><p>Explore common skin concerns, then book a consultation for a personalised recommendation.</p></div>
        <div className="concern-list">
          {["Dehydration & barrier support","Acne & congestion","Sensitivity & redness","Pigmentation & uneven tone","Fine lines & texture","Eye-area hydration"].map((item,index) =>
            <a href="/treatments" key={item}><span>0{index+1}</span><strong>{item}</strong><em>↗</em></a>)}
        </div>
      </section>

      <section className="locations-section" id="locations">
        <div className="locations-heading"><p className="kicker">Visit VenuX</p><h2>Two locations.<br /><span className="title-accent">One standard of care.</span></h2><p>Choose the clinic that is most convenient for your consultation or treatment.</p></div>
        <div className="location-grid environment-grid">
          {locations.map((location) => <article className="location-card environment-card" key={location.number}>
            <div className={`location-visual ${location.visual}`} role="img" aria-label={`${location.name} clinic environment photo placeholder`}>
              <span>Inside VenuX</span><strong>{location.name}</strong><small>Real clinic photography to be added</small>
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
