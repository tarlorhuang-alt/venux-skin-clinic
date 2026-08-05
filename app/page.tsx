import { Footer, Header } from "./site-chrome";

const popularTreatments = [
  { number: "01", duration: "90 min", name: <>Glass Skin<br />Facial</>, standard: 299, member: 259, featured: false },
  { number: "02", duration: "70 min", name: <>Sothys Hydra<br />Revitalizing</>, standard: 155, member: 125, featured: true },
  { number: "03", duration: "60 min", name: <>Carbon Laser<br />Facial</>, standard: 249, member: 199, featured: false },
];

const locations = [
  {
    number: "01",
    name: "Top Ryde",
    label: "VenuX Skin Clinic",
    address: <>Shop 3002, Top Ryde City Shopping Centre<br />Devlin Street &amp; Blaxland Road<br />Ryde NSW 2112</>,
    map: "https://www.google.com/maps/search/?api=1&query=Shop+3002+Top+Ryde+City+Shopping+Centre+Ryde+NSW+2112",
  },
  {
    number: "02",
    name: "Sydney CBD",
    label: "VenuX Aesthetics",
    address: <>515 Kent Street<br />Sydney NSW 2000</>,
    map: "https://www.google.com/maps/search/?api=1&query=515+Kent+Street+Sydney+NSW+2000",
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
      <section className="popular">
        <div className="section-heading">
          <div><p className="kicker">Most requested</p><h2>Popular treatments.</h2></div>
          <p>Three client favourites from the current VenuX menu, with verified standard and member pricing.</p>
        </div>
        <div className="popular-grid">
          {popularTreatments.map((treatment) => <article className={`popular-card${treatment.featured ? " featured" : ""}`} key={treatment.number}>
            <span>{treatment.number} · {treatment.duration}</span><h3>{treatment.name}</h3>
            <p>Standard <strong>${treatment.standard}</strong></p><p>Member <strong>${treatment.member}</strong></p>
            <div className="popular-actions"><a href="/pricing">View details</a><a className="popular-book" href={`/book?treatment=${treatment.number}`}>Book now ↗</a></div>
          </article>)}
        </div>
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
        <div className="location-grid">
          {locations.map((location) => <article className="location-card" key={location.number}>
            <span>{location.number}</span><p>{location.label}</p><h3>{location.name}</h3><address>{location.address}</address>
            <div><a href={location.map} target="_blank" rel="noreferrer">Open in Maps ↗</a><a className="button dark" href="/book">Book here</a></div>
          </article>)}
        </div>
      </section>
      <Footer />
    </main>
  );
}
