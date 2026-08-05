const navigation = [
  {
    label: "Skin",
    href: "/treatments#skin",
    items: [
      ["Facial Treatments", "/pricing"],
      ["Laser Facial", "/treatments#skin"],
      ["IPL", "/treatments#skin"],
      ["HIFU / Ultherapy", "/#popular"],
      ["RF Microneedling", "/#popular"],
      ["DMK Enzyme Therapy", "/pricing"],
      ["LED Light Therapy", "/pricing"],
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
      ["Skin Quality Consultation", "/treatments#aesthetics"],
      ["Personalised Treatment Plan", "/book"],
    ],
  },
  {
    label: "Methods",
    href: "/treatments#methods",
    items: [
      ["Laser & Light", "/treatments#methods"],
      ["Ultrasound", "/treatments#methods"],
      ["Radiofrequency", "/treatments#methods"],
      ["Enzyme Therapy", "/treatments#methods"],
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
        <a className="nav-direct" href="/pricing">Pricing</a>
        <a className="nav-direct" href="/membership">Membership</a>
      </nav>

      <a className="header-cta" href="/book">Book now</a>
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
