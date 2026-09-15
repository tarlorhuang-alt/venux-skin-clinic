"use client";

import "../admin.css";
import "./clinical-list.css";

export default function ClientsError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  return <main className="client-error-page">
    <section className="admin-panel client-error-card">
      <p>Client records are safe</p>
      <h1>The client list could not load.</h1>
      <span>The database connection was interrupted. Try the list again, or return to bookings while it reconnects.</span>
      <div><button type="button" onClick={()=>reset()}>Try again</button><a href="/admin/bookings">Go to bookings</a></div>
    </section>
  </main>;
}
