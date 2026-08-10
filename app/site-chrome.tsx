const navigation = [
  {
    label: "Skin",
    menuLabel: "Skin treatments",
    href: "/treatments#skin",
    items: [
      ["Facial Treatments", "/treatments/facial-treatments"],
      ["CO₂ Laser", "/treatments/laser-facial"],
      ["Lutronic Picosecond", "/treatments/lutronic-picosecond"],
      ["IPL Photorejuvenation", "/treatments/ipl"],
      ["Ultherapy®", "/treatments/hifu-ultherapy"],
      ["HIFU Focused Ultrasound", "/treatments/hifu-focused-ultrasound"],
      ["RF Microneedling", "/treatments/rf-microneedling"],
      ["DMK Enzyme Therapy", "/treatments/dmk-enzyme-therapy"],
      ["LED Light Therapy", "/treatments/led-light-therapy"],
    ],
  },
  {
    label: "Body",
    menuLabel: "Body treatments",
    href: "/treatments#body",
    items: [
      ["Body Consultation", "/book"],
      ["Body Contouring", "/book"],
      ["Skin Tightening", "/book"],
      ["Stretch Marks & Scarring", "/book"],
      ["Personalised Body Plan", "/book"],
    ],
  },
  {
    label: "Aesthetics",
    menuLabel: "Cosmetic aesthetics",
    href: "/treatments#aesthetics",
    items: [
      ["Rejuran® Skin Rejuvenation · New", "/book"],
      ["Lines & Wrinkles", "/book"],
      ["Facial Volume, Definition & Structure", "/book"],
      ["Hydration & Restoration", "/treatments/skin-booster"],
      ["Bio Remodelling", "/book"],
      ["Hyperhidrosis", "/book"],
      ["Lip Volume & Definition", "/book"],
      ["PDO Mono Threads", "/book"],
      ["Skin Rejuvenation", "/book"],
    ],
  },
  {
    label: "Methods",
    menuLabel: "Treatment methods",
    href: "/treatments#methods",
    items: [
      ["IPL · Laser & Light", "/treatments/ipl"],
      ["Lutronic Picosecond", "/treatments/lutronic-picosecond"],
      ["Ultherapy®", "/treatments/hifu-ultherapy"],
      ["HIFU Focused Ultrasound", "/treatments/hifu-focused-ultrasound"],
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
        <span>VenuX <span className="brand-subtitle">Skin Clinic</span></span>
      </a>

      <nav className="category-nav" aria-label="Treatment categories">
        {navigation.map((category) => <div className="nav-category" key={category.label}>
          <a className="nav-category-link" href={category.href}>{category.label}<span>⌄</span></a>
          <div className="nav-dropdown">
            <small>{category.menuLabel}</small>
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
          <span className="star-mark" aria-hidden="true"><span>✦</span><b>V</b><span>✦</span></span>
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
        <a href="https://www.instagram.com/venuxbeautysydney/" target="_blank" rel="noreferrer" aria-label="Follow VenuX Beauty Sydney on Instagram"><b>Instagram ↗</b><small>@VenuxBeautySydney</small></a>
        <a href="https://wa.me/61432752750" target="_blank" rel="noreferrer" aria-label="Chat with VenuX Skin Clinic on WhatsApp"><b>WhatsApp ↗</b><small>0432 752 750</small></a>
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
      <h1>{title}<br /><span className="title-accent">{italic}</span></h1>
      <p>{intro}</p>
    </section>
  );
}
