"use client";

import { FormEvent, useState } from "react";

export function BookingForm() {
  const [submitted, setSubmitted] = useState(false);
  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }
  return (
    <form onSubmit={submitBooking}>
      <label>Full name<input required name="name" autoComplete="name" placeholder="Your name" /></label>
      <label>Mobile<input required name="mobile" inputMode="tel" autoComplete="tel" placeholder="04XX XXX XXX" /></label>
      <label>Email<input required name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
      <label>What can we help with?
        <select name="interest" defaultValue="">
          <option value="" disabled>Select an area</option>
          <option>Skin consultation</option><option>Facial treatments</option>
          <option>Advanced skin</option><option>Clinical consultation</option><option>Membership</option>
        </select>
      </label>
      <label className="full">Tell us a little more<textarea name="message" rows={4} placeholder="Your goals, preferred days, or questions" /></label>
      <button className="button dark full" type="submit">Request a consultation</button>
      {submitted && <p className="success full" role="status">Thank you. Your request has been prepared. Connect the clinic inbox to receive live enquiries.</p>}
    </form>
  );
}
