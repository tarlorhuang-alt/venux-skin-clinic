import { Footer, Header, PageHero } from "../site-chrome";

export default function Membership() {
  return <main><Header />
    <PageHero kicker="VenuX Membership" title="Your skin ritual," italic="made consistent." intro="A considered way to maintain your skin plan, receive preferred pricing and book with confidence." />
    <section className="membership membership-page">
      <div><p className="kicker light">Member care</p><h2>More continuity.<br /><i>More value.</i></h2></div>
      <div className="member-copy"><p>Membership supports ongoing skin health with preferred treatment pricing and a personalised plan.</p>
        <ul><li><span>✓</span> Member pricing on eligible treatments</li><li><span>✓</span> Personalised treatment planning</li><li><span>✓</span> Priority booking access</li><li><span>✓</span> Regular plan reviews</li></ul>
        <a href="/pricing" className="text-link member-link">Compare member prices <span>↘</span></a>
      </div>
    </section>
    <section className="simple-cta"><p className="kicker">Membership enquiry</p><h2>Make space for<br />consistent care.</h2><a className="button dark" href="/book">Ask about membership</a></section>
    <Footer />
  </main>;
}
