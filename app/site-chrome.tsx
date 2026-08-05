const navigation = [
  {
    label: "Skin",
    href: "/treatments#skin",
    items: [
      ["Facial Treatments", "/pricing"],
      ["Laser Facial", "/treatments/laser-facial"],
      ["IPL", "/treatments/ipl"],
      ["HIFU / Ultherapy", "/treatments/hifu-ultherapy"],
      ["RF Microneedling", "/treatments/rf-microneedling"],
      ["DMK Enzyme Therapy", "/treatments/dmk-enzyme-therapy"],
      ["LED Light Therapy", "/treatments/led-light-therapy"],
    ],
  },
  {
    label: "Body",
    href: "/treatments#body",
    items: [
      ["Body Consultation", "/treatments#body"],
      ["Body Treatment Planning", "/treatments#body"],
      ["Book an Assessment", "/book"],
    ],
  },
  {
    label: "Aesthetics",
    href: "/treatments#aesthetics",
    items: [
      ["Aesthetic Consultation", "/treatments#aesthetics"],
      ["Skin Booster", "/treatments/skin-booster"],
      ["Skin Quality Consultation", "/treatments#aesthetics"],
      ["Personalised Treatment Plan", "/book"],
    ],
  },
  {
    label: "Methods",
    href: "/treatments#methods",
    items: [
      ["IPL · Laser & Light", "/treatments/ipl"],
      ["Ultrasound", "/treatments/hifu-ultherapy"],
      ["Radiofrequency", "/treatments/rf-microneedling"],
      ["Enzyme Therapy", "/treatments/dmk-enzyme-therapy"],
    ],
  },
] as const;

export function Header() {
  return (
    <header className="site-header category-header">
      <a className="brand" href="/" aria-label="VenuX Skin Clinic home">
        <span className="brand-mark">V</span>
        <span>VenuX <em>Skin Clinic</em></span>
      </a>

      <nav className="category-nav" aria-label="Treatment categories">
        {navigation.map((category) => <div className="nav-category" key={category.label}>
          <a className="nav-category-link" href={category.href}>{category.label}<span>⌄</span></a>
          <div className="nav-dropdown">
            <small>{category.label} treatments</small>
            {category.items.map(([label, href]) => <a href={href} key={label}>{label}<span>↗</span></a>)}
          </div>
        </div>)}
        <a className="nav-direct" href="/products">Products</a>
        <a className="nav-direct" href="/pricing">Pricing</a>
        <a className="nav-direct" href="/membership">Membership</a>
      </nav>

      <a className="header-cta" href="/book">Book now</a>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-identity">
        <a className="footer-star-brand" href="/" aria-label="VenuX Skin Clinic home">
          <span className="star-mark" aria-hidden="true"><i>✦</i><b>V</b><em>✦</em></span>
          <span><strong>VenuX</strong><small>Skin Clinic</small></span>
        </a>
        <p>Personalised skin care and aesthetic treatments, thoughtfully delivered in Sydney.</p>
      </div>

      <div className="footer-column">
        <span>Explore</span>
        <a href="/treatments">Treatments ↗</a>
        <a href="/products">Products ↗</a>
        <a href="/pricing">Pricing ↗</a>
        <a href="/membership">Membership ↗</a>
        <a href="/book">Book a consultation ↗</a>
      </div>

      <div className="footer-column footer-social">
        <span>Connect</span>
        <div aria-label="Instagram account pending"><b>Instagram</b><small>Link to be connected</small></div>
        <div aria-label="WhatsApp account pending"><b>WhatsApp</b><small>Number to be connected</small></div>
      </div>

      <div className="footer-column footer-visit">
        <span>Visit</span>
        <a href="/#locations"><b>Top Ryde</b><small>Shop 3002 · Ryde NSW 2112</small></a>
        <a href="/#locations"><b>Sydney CBD</b><small>515 Kent Street · Sydney NSW 2000</small></a>
      </div>

      <div className="footer-bottom">
        <small>© 2026 VenuX Skin Clinic</small>
        <small>Treatment suitability varies · Consultation required</small>
      </div>
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
