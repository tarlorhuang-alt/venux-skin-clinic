import { Footer, Header } from "./site-chrome";

export default function Home() {
  return (
    <main>
      <Header />
      <section className="poster-hero">
        <div className="poster-copy">
          <p className="kicker">VenuX · Premium Skin & Aesthetic Clinic</p>
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
          <a href="/pricing" className="popular-card"><span>01 · 90 min</span><h3>Glass Skin<br />Facial</h3><p>Standard <strong>$299</strong></p><p>Member <strong>$259</strong></p><em>View details ↗</em></a>
          <a href="/pricing" className="popular-card featured"><span>02 · 70 min</span><h3>Sothys Hydra<br />Revitalizing</h3><p>Standard <strong>$155</strong></p><p>Member <strong>$125</strong></p><em>View details ↗</em></a>
          <a href="/pricing" className="popular-card"><span>03 · 60 min</span><h3>Carbon Laser<br />Facial</h3><p>Standard <strong>$249</strong></p><p>Member <strong>$199</strong></p><em>View details ↗</em></a>
        </div>
      </section>
      <section className="concerns">
        <div className="concerns-heading"><p className="kicker light">Main concerns</p><h2>Start with what<br /><i>matters to you.</i></h2><p>Explore common skin concerns, then book a consultation for a personalised recommendation.</p></div>
        <div className="concern-list">
          {["Dehydration & barrier support","Acne & congestion","Sensitivity & redness","Pigmentation & uneven tone","Fine lines & texture","Eye-area hydration"].map((item,index) =>
            <a href="/treatments" key={item}><span>0{index+1}</span><strong>{item}</strong><em>↗</em></a>)}
        </div>
      </section>
      <section className="intro">
        <div><p className="kicker">Discover VenuX</p><h2>A clearer path<br />to your skin goals.</h2></div>
        <div className="home-links">
          <a href="/treatments"><span>01</span><strong>Treatments</strong><em>Explore facial, advanced skin and consultation-led care.</em></a>
          <a href="/pricing"><span>02</span><strong>Pricing</strong><em>View verified standard and member pricing.</em></a>
          <a href="/membership"><span>03</span><strong>Membership</strong><em>Make considered skin care part of your routine.</em></a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
