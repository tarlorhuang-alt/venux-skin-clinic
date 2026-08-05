import { Footer, Header, PageHero } from "../site-chrome";
import { addOnPrices, facialPrices } from "../site-data";

export default function Pricing() {
  return <main><Header />
    <PageHero kicker="Treatment menu" title="Transparent" italic="by design." intro="Current verified VenuX facial prices. All amounts are in AUD and suitability is confirmed before treatment." />
    <section className="pricing page-section">
      <div className="price-table" role="table" aria-label="Treatment prices">
        <div className="price-row table-head" role="row"><span>Treatment</span><span>Standard</span><span>Member</span></div>
        {facialPrices.map(([item,duration,standard,member]) => <div className="price-row" role="row" key={item}>
          <span>{item}<small>{duration} · Facial treatment</small></span><strong>${standard}</strong><strong>${member}</strong>
        </div>)}
      </div>
      <div className="sub-price-heading"><h3>Enhance your treatment</h3><span>Add-ons</span></div>
      <div className="price-table compact">{addOnPrices.map(([item,standard,member]) => <div className="price-row" key={item}>
        <span>{item}<small>Add-on</small></span><strong>${standard}</strong><strong>${member}</strong>
      </div>)}</div>
      <div className="clinical-notice"><div><span>Clinical services</span><h3>Consultation-led care</h3></div>
        <p>Some higher-risk cosmetic procedures and prescription-only treatments cannot be advertised with public product pricing. A qualified practitioner will discuss suitability, risks, recovery and a personalised quotation.</p>
        <a href="/book" className="text-link">Request a consultation <span>↘</span></a></div>
    </section><Footer />
  </main>;
}
