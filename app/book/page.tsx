import { BookingForm } from "../booking-form";
import { PayPalCheckout } from "../paypal-checkout";
import { Footer, Header, PageHero } from "../site-chrome";

export default function Book() {
  return <main><Header />
    <PageHero kicker="Begin your journey" title="Let’s talk" italic="about your skin." intro="Share a few details and the VenuX team can follow up to confirm your consultation, treatment and final fee." />
    <section className="booking booking-page">
      <div className="booking-intro"><p className="kicker">Book & pay</p><h2>Your next step,<br />made simple.</h2>
        <p>Choose a preferred clinic, date and time, then secure the request with a fixed AUD $45 deposit. Your requested time and treatment suitability remain subject to clinic confirmation.</p>
        <div className="contact-card paypal-card">
          <span>Secure booking deposit</span>
          <div className="deposit-line"><strong>AUD $45</strong><small>Fixed deposit</small></div>
          <ul className="deposit-policy-list"><li>Fully credited toward your booked treatment</li><li>Reschedule with at least 24 hours’ notice</li><li>Late changes and no-shows may forfeit the deposit</li></ul>
          <PayPalCheckout />
          <small className="deposit-note">Payment does not automatically confirm the requested time or treatment suitability. The clinic will contact you to confirm your appointment.</small>
        </div>
      </div>
      <BookingForm />
    </section><Footer />
  </main>;
}
