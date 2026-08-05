import { BookingForm } from "../booking-form";
import { PayPalCheckout } from "../paypal-checkout";
import { Footer, Header, PageHero } from "../site-chrome";

export default function Book() {
  return <main><Header />
    <PageHero kicker="Begin your journey" title="Let’s talk" italic="about your skin." intro="Share a few details and the VenuX team can follow up to confirm your consultation, treatment and final fee." />
    <section className="booking booking-page">
      <div className="booking-intro"><p className="kicker">Book & pay</p><h2>Your next step,<br />made simple.</h2>
        <p>Secure your appointment request with a fixed AUD $45 booking deposit. The deposit is processed securely by PayPal and your treatment suitability remains subject to consultation.</p>
        <div className="contact-card paypal-card">
          <span>Secure booking deposit</span>
          <div className="deposit-line"><strong>AUD $45</strong><small>Fixed deposit</small></div>
          <PayPalCheckout />
          <small className="deposit-note">Payment does not confirm treatment suitability. The clinic will contact you to confirm your appointment.</small>
        </div>
      </div>
      <BookingForm />
    </section><Footer />
  </main>;
}
