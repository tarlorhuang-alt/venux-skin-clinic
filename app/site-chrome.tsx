export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="VenuX Skin Clinic home">
        <span className="brand-mark">V</span>
        <span>VenuX <em>Skin Clinic</em></span>
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        <a href="/treatments">Treatments</a>
        <a href="/pricing">Pricing</a>
        <a href="/membership">Membership</a>
      </nav>

      <div className="header-actions">
        <a className="header-cta" href="/book">Book now</a>
        <details className="menu-shell">
          <summary aria-label="Open navigation menu">
            <span className="menu-label">Menu</span>
            <span className="menu-icon" aria-hidden="true"><i /><i /></span>
          </summary>
          <div className="menu-backdrop" aria-hidden="true" />
          <div className="menu-panel">
            <div className="menu-top">
              <a className="menu-brand" href="/">VenuX <span>Skin Clinic</span></a>
              <span className="menu-hint">Select a page</span>
            </div>

            <nav className="mega-nav" aria-label="Expanded navigation">
              <a className="mega-main" href="/">Home</a>
              <a className="mega-main" href="/#about">About</a>

              <section className="mega-group">
                <a className="mega-main" href="/treatments">Treatments <span>↓</span></a>
                <ul>
                  <li><a href="/treatments">Skin Treatments</a></li>
                  <li><a href="/treatments#consultation">Cosmetic Injectables</a></li>
                  <li><a href="/treatments">Laser &amp; Light</a></li>
                  <li><a href="/treatments">Facial Treatments</a></li>
                  <li><a href="/pricing">Treatment Pricing</a></li>
                </ul>
              </section>

              <section className="mega-group">
                <a className="mega-main" href="/treatments">Skin Concerns <span>↓</span></a>
                <ul>
                  <li><a href="/treatments">Acne &amp; Congestion</a></li>
                  <li><a href="/treatments">Pigmentation</a></li>
                  <li><a href="/treatments">Fine Lines &amp; Texture</a></li>
                  <li><a href="/treatments">Redness &amp; Sensitivity</a></li>
                  <li><a href="/treatments">Dehydration &amp; Barrier</a></li>
                </ul>
              </section>

              <a className="mega-main" href="/membership">Membership</a>
              <a className="mega-main" href="/pricing">Pricing &amp; Promotions</a>
            </nav>

            <div className="menu-bottom">
              <span>EN <b>|</b> 中文</span>
              <a href="/book">Book now <span>↗</span></a>
            </div>
          </div>
        </details>
      </div>
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
