import { BookingForm } from "../booking-form";
import { Footer, Header, PageHero } from "../site-chrome";

export default function Book() {
  return <main><Header />
    <PageHero kicker="Begin your journey" title="Let’s talk" italic="about your skin." intro="Share a few details and the VenuX team can follow up to confirm your consultation, treatment and final fee." />
    <section className="booking booking-page">
      <div className="booking-intro"><p className="kicker">Book & pay</p><h2>Your next step,<br />made simple.</h2>
        <p>After your booking and final fee are confirmed, the clinic can send a secure PayPal payment request.</p>
        <div className="contact-card"><span>Secure online payment</span><strong>PayPal checkout is ready to be connected once the clinic merchant link is supplied.</strong><button disabled>PayPal · Merchant link required</button></div>
      </div>
      <BookingForm />
    </section><Footer />
  </main>;
}
