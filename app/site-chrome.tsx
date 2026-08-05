export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="VenuX Skin Clinic home">
        <span className="brand-mark">V</span>
        <span>VenuX <em>Skin Clinic</em></span>
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        <a href="/treatments#skin">Skin</a>
        <a href="/treatments#body">Body</a>
        <a href="/treatments#aesthetics">Aesthetics</a>
        <a href="/treatments#methods">Methods</a>
        <a href="/pricing">Pricing</a>
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
              <span className="menu-hint">Explore our clinic</span>
            </div>

            <nav className="mega-nav" aria-label="Expanded navigation">
              <div className="mega-overview">
                <a className="mega-main" href="/">Home</a>
                <a className="mega-main" href="/#about">About</a>
                <a className="mega-main" href="/pricing">Pricing</a>
                <a className="mega-main" href="/membership">Membership</a>
              </div>

              <section className="mega-group" id="menu-skin">
                <a className="mega-main" href="/treatments#skin">Skin Treatments <span>↓</span></a>
                <ul>
                  <li><a href="/treatments#skin">Facial Treatments</a></li>
                  <li><a href="/treatments#skin">Laser Facial</a></li>
                  <li><a href="/treatments#skin">DMK Skin Revision</a></li>
                  <li><a href="/treatments#skin">LED Light Therapy</a></li>
                  <li><a href="/pricing">Skin Treatment Pricing</a></li>
                </ul>
              </section>

              <section className="mega-group" id="menu-body">
                <a className="mega-main" href="/treatments#body">Body Treatments <span>↓</span></a>
                <ul>
                  <li><a href="/treatments#body">Body Consultation</a></li>
                  <li><a href="/treatments#body">Personalised Body Plan</a></li>
                  <li><a href="/book">Request an Assessment</a></li>
                </ul>
              </section>

              <section className="mega-group" id="menu-aesthetics">
                <a className="mega-main" href="/treatments#aesthetics">Aesthetics <span>↓</span></a>
                <ul>
                  <li><a href="/treatments#aesthetics">Aesthetic Consultation</a></li>
                  <li><a href="/treatments#aesthetics">Suitability Assessment</a></li>
                  <li><a href="/treatments#aesthetics">Individual Treatment Plan</a></li>
                  <li><a href="/book">Book a Consultation</a></li>
                </ul>
              </section>

              <section className="mega-group" id="menu-methods">
                <a className="mega-main" href="/treatments#methods">Treatment Methods <span>↓</span></a>
                <ul>
                  <li><a href="/treatments#methods">Laser &amp; Light</a></li>
                  <li><a href="/treatments#methods">Facial Therapy</a></li>
                  <li><a href="/treatments#methods">Enzyme Therapy</a></li>
                  <li><a href="/treatments#methods">Consultation-led Care</a></li>
                </ul>
              </section>
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
