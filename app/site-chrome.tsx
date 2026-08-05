export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="VenuX Skin Clinic home">
        <span className="brand-mark">V</span>
        <span>VenuX <em>Skin Clinic</em></span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/treatments">Treatments</a>
        <a href="/pricing">Pricing</a>
        <a href="/membership">Membership</a>
        <a href="/book">Book & Pay</a>
      </nav>
      <a className="header-cta" href="/book">Book a consultation</a>
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <a className="brand footer-brand" href="/"><span className="brand-mark">V</span><span>VenuX <em>Skin Clinic</em></span></a>
      <p>Personalised skin care in Australia.</p>
      <div><a href="/treatments">Treatments</a><a href="/pricing">Pricing</a><a href="/book">Book</a></div>
      <small>© 2026 VenuX Skin Clinic · Treatment suitability varies. Consultation required.</small>
    </footer>
  );
}

export function PageHero({ kicker, title, italic, intro }: { kicker: string; title: string; italic: string; intro: string }) {
  return (
    <section className="page-hero">
      <p className="kicker">{kicker}</p>
      <h1>{title}<br /><i>{italic}</i></h1>
      <p>{intro}</p>
    </section>
  );
}
