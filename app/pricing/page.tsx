import { Footer, Header, PageHero } from "../site-chrome";
import { addOnPrices, facialPriceGroups } from "../site-data";

export default function Pricing() {
  return <main><Header />
    <PageHero kicker="Treatment menu" title="Transparent" italic="by design." intro="Current verified VenuX facial prices, organised by your treatment goals. All amounts are in AUD." />
    <section className="pricing page-section">
      <div className="pricing-key" aria-label="Price column guide">
        <span>Treatment</span><span>Duration</span><span>Regular</span><span>Member</span>
      </div>
      <div className="price-groups">
        {facialPriceGroups.map((group) => <section className="price-group" key={group.number}>
          <div className="price-group-heading"><span>{group.number}</span><h2>{group.category}</h2></div>
          <div className="price-table" role="table" aria-label={`${group.category} prices`}>
            {group.items.map(([item,duration,regular,member]) => <div className="price-row detailed" role="row" key={item}>
              <span>{item}</span><small>{duration}</small><strong>${regular}</strong><strong>${member}</strong>
            </div>)}
          </div>
        </section>)}
      </div>

      <section className="price-group add-on-group">
        <div className="price-group-heading"><span>07</span><h2>Add-ons</h2></div>
        <div className="price-table compact" role="table" aria-label="Add-on prices">
          {addOnPrices.map(([item,regular,member]) => <div className="price-row detailed" role="row" key={item}>
            <span>{item}</span><small>—</small><strong>${regular}</strong><strong>${member}</strong>
          </div>)}
        </div>
      </section>

      <div className="clinical-notice"><div><span>Clinical services</span><h3>Consultation-led care</h3></div>
        <p>Higher-risk cosmetic procedures and prescription-only treatments are not displayed with public brand pricing. An appropriately qualified practitioner will discuss suitability, risks, recovery and a personalised quotation during your consultation.</p>
        <a href="/book" className="text-link">Request a consultation <span>↘</span></a></div>
      <p className="price-note">Prices are in Australian dollars and may change. Treatment suitability is confirmed before your appointment.</p>
    </section><Footer />
  </main>;
}
