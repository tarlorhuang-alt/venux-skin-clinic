"use client";

import { FormEvent, useState } from "react";

export function BookingForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setError("");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/bookings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(Object.fromEntries(new FormData(form))) });
      const result = await response.json();
      if (response.ok) { setSubmitted(true); setReference(result.reference); form.reset(); }
      else setError(result.error || "Unable to save your request.");
    } catch {
      setError("Unable to connect. Please contact the clinic directly.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form onSubmit={submitBooking}>
      <label>Full name<input required name="name" autoComplete="name" placeholder="Your name" /></label>
      <label>Mobile<input required name="mobile" inputMode="tel" autoComplete="tel" placeholder="04XX XXX XXX" /></label>
      <label>Email<input required name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
      <label>What can we help with?
        <select required name="interest" defaultValue="">
          <option value="" disabled>Select an area</option>
          <option>Skin consultation</option><option>Facial treatments</option>
          <option>Advanced skin</option><option>Clinical consultation</option><option>Membership</option>
        </select>
      </label>
      <label>Preferred clinic
        <select required name="clinic" defaultValue=""><option value="" disabled>Select a clinic</option><option>Top Ryde · Shop 3002</option><option>Sydney City · 515 Kent Street</option></select>
      </label>
      <label>Preferred date<input required name="date" type="date" /></label>
      <label>Preferred time
        <select required name="time" defaultValue=""><option value="" disabled>Select a time</option>{["10:00 AM","11:00 AM","12:00 PM","1:30 PM","2:30 PM","3:30 PM","4:30 PM","5:30 PM"].map(time=><option key={time}>{time}</option>)}</select>
        <small className="field-note">Requested time only. The clinic will confirm availability.</small>
      </label>
      <label className="full">Tell us a little more<textarea name="message" rows={4} placeholder="Your goals, treatment questions or accessibility needs" /></label>
      <label className="full booking-policy-check"><input required name="deposit-policy" type="checkbox" /><span>I understand the AUD $45 deposit is fully credited toward my booked treatment. I may reschedule without losing the deposit when I give at least 24 hours’ notice. Late changes and no-shows may forfeit the deposit.</span></label>
      <label className="full booking-policy-check"><input name="serviceSmsConsent" value="yes" type="checkbox" /><span>Send me factual appointment confirmations and reminders by SMS.</span></label>
      <label className="full booking-policy-check"><input name="marketingSmsConsent" value="yes" type="checkbox" /><span>I agree to receive birthday wishes and occasional VenuX offers by SMS. I can opt out at any time.</span></label>
      <button className="button dark full" type="submit" disabled={submitting}>{submitting ? "Saving request…" : "Request a consultation"}</button>
      {error && <p className="admin-error full" role="alert">{error}</p>}
      {submitted && <p className="success full" role="status">Thank you. Your request {reference} is now in the VenuX booking system. Your selected time is not confirmed until the clinic contacts you and the AUD $45 deposit is received.</p>}
    </form>
  );
}
