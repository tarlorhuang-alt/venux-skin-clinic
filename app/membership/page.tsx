import type { Metadata } from "next";
import { Footer, Header, PageHero } from "../site-chrome";

export const metadata: Metadata = {
  title: "VenuX Membership | Member Treatment Pricing",
  description: "Join VenuX Membership with a prepaid balance from AUD $1,000 and access clearly labelled member treatment prices.",
};

export default function Membership() {
  return <main><Header />
    <PageHero kicker="VenuX Membership" title="Prepay from $1,000." italic="Access member pricing." intro="A simple prepaid membership for consistent care: most eligible treatments are 20% off, while DMK and Rejuran member prices are 15% off regular price." />

    <section className="membership membership-page">
      <div>
        <p className="kicker light">The membership offer</p>
        <h2>One balance.<br /><span className="title-accent">Clearly labelled member prices.</span></h2>
        <div className="member-value"><small>Minimum prepaid balance</small><strong>AUD $1,000</strong><span>Membership begins once the balance is received.</span></div>
      </div>
      <div className="member-copy">
        <p>Use your prepaid VenuX balance toward eligible clinic treatments and see the exact member price before booking.</p>
        <ul>
          <li><span>✓</span> Start with a minimum AUD $1,000 prepaid balance</li>
          <li><span>✓</span> Receive 20% off most eligible VenuX treatments</li>
          <li><span>✓</span> DMK and Rejuran member prices are 15% off regular price</li>
          <li><span>✓</span> Use your balance across personalised treatment plans</li>
          <li><span>✓</span> Access member pricing from your first eligible appointment</li>
          <li><span>✓</span> Receive ongoing treatment planning and booking support</li>
        </ul>
        <a href="/book?membership=1000" className="button light-button">Join from $1,000</a>
      </div>
    </section>

    <section className="membership-steps">
      <article><span>01</span><h3>Join</h3><p>Contact the clinic and choose a prepaid balance of AUD $1,000 or more.</p></article>
      <article><span>02</span><h3>Plan</h3><p>Discuss your goals and build a personalised VenuX treatment plan.</p></article>
      <article><span>03</span><h3>Save</h3><p>Use the clearly labelled member price and pay from your available member balance.</p></article>
    </section>

    <section className="simple-cta">
      <p className="kicker">Membership enquiry</p>
      <h2>Ready for more<br />consistent care?</h2>
      <p>Our team will confirm your membership setup and payment instructions before funds are accepted.</p>
      <a className="button dark" href="/book?membership=1000">Enquire about membership</a>
    </section>
    <Footer />
  </main>;
}
