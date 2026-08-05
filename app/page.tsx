import { Footer, Header } from "./site-chrome";

const popularTreatments = [
  {
    number: "01", label: "Ultrasound lifting", name: <>Ultherapy</>, detail: "Lower face · pricing from", standard: "$2,200", member: "$1,980", featured: false, poster: "ultherapy", posterLine: "Lift · Define · Refine",
  },
  {
    number: "02", label: "Skin quality", name: <>Rejuran<br />Skin Booster</>, detail: "Rejuran Healer 2ml · pricing from", standard: "$750", member: "$650", featured: true, poster: "booster", posterLine: "Repair · Hydrate · Renew",
  },
  {
    number: "03", label: "Texture & renewal", name: <>RF<br />Microneedling</>, detail: "Full face · pricing from", standard: "$599", member: "$499", featured: false, poster: "rf", posterLine: "Firm · Smooth · Restore",
  },
];

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

export default function Home() {
  return (
    <main>
      <Header />
      <section className="poster-hero">
        <div className="poster-copy">
          <p className="kicker premium-kicker"><strong>VenuX Premium</strong> Skin &amp; Aesthetic Clinic</p>
          <h1>Natural Beauty,<br /><i>Refined by Science.</i></h1>
          <p>VenuX brings thoughtful skin care and aesthetic precision together through personalised, consultation-led treatment plans.</p>
          <div className="hero-actions">
            <a className="button dark" href="/book">Book a consultation</a>
            <a className="button outline-button" href="/treatments">View treatments</a>
          </div>
        </div>
        <span className="poster-caption">Personalised care · Professional standards · Considered results</span>
      </section>
      <section className="principles"><span>01 · Personalised plans</span><span>02 · Considered care</span><span>03 · Natural-looking results</span></section>
      <section className="popular" id="popular">
        <div className="section-heading">
          <div><p className="kicker">Most requested</p><h2>Popular treatments.</h2></div>
          <p>Three advanced VenuX treatment pathways with market-referenced starting prices. Final treatment area, suitability and quotation are confirmed after assessment.</p>
        </div>
        <div className="popular-grid poster-grid">
          {popularTreatments.map((treatment) => <article className={`popular-card poster-card${treatment.featured ? " featured" : ""}`} key={treatment.number}>
            <div className={`treatment-poster ${treatment.poster}`}>
              <span>VenuX · Advanced Aesthetics</span>
              <b>{treatment.number}</b>
              <strong>{treatment.name}</strong>
              <small>{treatment.posterLine}</small>
            </div>
            <div className="popular-card-copy">
              <span>{treatment.number} · {treatment.label}</span><h3>{treatment.name}</h3><em>{treatment.detail}</em>
              <p>Standard <strong>{treatment.standard}</strong></p><p>Member <strong>{treatment.member}</strong></p>
              <div className="popular-actions"><a href="/treatments">View details</a><a className="popular-book" href={`/book?treatment=${encodeURIComponent(treatment.label)}`}>Book assessment ↗</a></div>
            </div>
          </article>)}
        </div>
        <p className="popular-price-note">All prices are in AUD and are starting prices only. Final pricing depends on treatment area, practitioner assessment and individual suitability.</p>
      </section>
      <section className="concerns">
        <div className="concerns-heading"><p className="kicker light">Main concerns</p><h2>Start with what<br /><i>matters to you.</i></h2><p>Explore common skin concerns, then book a consultation for a personalised recommendation.</p></div>
        <div className="concern-list">
          {["Dehydration & barrier support","Acne & congestion","Sensitivity & redness","Pigmentation & uneven tone","Fine lines & texture","Eye-area hydration"].map((item,index) =>
            <a href="/treatments" key={item}><span>0{index+1}</span><strong>{item}</strong><em>↗</em></a>)}
        </div>
      </section>
      <section className="locations-section" id="locations">
        <div className="locations-heading"><p className="kicker">Visit VenuX</p><h2>Two locations.<br /><i>One standard of care.</i></h2><p>Choose the clinic that is most convenient for your consultation or treatment.</p></div>
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
