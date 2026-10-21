# Deployment

This repository is connected to the Vercel `venux` project. Commits to `main` trigger production deployments.

## Appointment confirmation and care workflow

Production requires `DATABASE_URL`, `CLICKSEND_USERNAME`, `CLICKSEND_API_KEY`,
`CRON_SECRET` and `NEXT_PUBLIC_SITE_URL` (the production HTTPS origin). Keep
credentials in Vercel environment settings, never in the repository. Redeploy
when changing Vercel environment variables. `CLICKSEND_FROM` is optional; omit
it to use ClickSend's default sender rather than an unverified sender number.

This project uses Vercel Hobby. The existing daily task
`/api/cron/birthday-messages` at `0 22 * * *` UTC now sends all tomorrow's
appointment confirmations and prepares today's birthday promotions for staff
review. This is nominally 9 AM Sydney daylight time / 8 AM standard time;
Hobby execution may be delayed. Confirm `CRON_SECRET` is configured in Vercel
Production and inspect Vercel's Cron execution history. The dashboard reports
if the secret is missing. Vercel authenticates scheduled calls using that secret.

Birthday promotions are queued, not automatically sent. Staff can edit the
promotion text in Messages and click Send; marketing consent and unsubscribe
status are checked again immediately before sending. Dashboard birthday
reminders can include clients without marketing consent for appropriate
non-SMS follow-up. Existing recorded consent is automatically loaded when a
client is selected in the booking form; no historic marketing opt-in is invented.

Appointments created for today or tomorrow are checked immediately after
creation, so bookings made after the daily run are not missed. Each immediate
check is restricted to that appointment. A schedule-specific event key prevents
the daily job and the immediate check from duplicating the same SMS. Future
appointments further ahead wait for the daily job. The daily job also catches
missed upcoming appointments today. Only future, active, consenting bookings
are eligible.

The optional `/api/cron/appointment-confirmations` endpoint still supports
an external five-minute scheduler for the rolling 24-hour window. No external
scheduler is required for the new previous-calendar-day workflow. An authenticated
production cron call sends real eligible messages; do not invoke it merely to
check connectivity. Unauthenticated requests must return 401.

The scheduler calculates the appointment instant in Australia/Sydney, including
DST. The optional rolling scheduler selects future appointments within 24 hours;
the daily scheduler uses the previous-calendar-day rule described above. Downtime may
delay delivery. Cancelled, completed, in-progress, past and change-requested
appointments are excluded. Date/time-specific outbox keys prevent repeated
cron executions from sending the same message twice. Failed scheduled messages
are retried at most three times, at least 15 minutes apart; inspect remaining
failures in `/admin/messages`. A message left in `sending` after a process crash
needs provider-status reconciliation before a manual retry to avoid duplicates.
`sent` means provider acceptance, not carrier delivery.

Customers follow one confirmation link to confirm/request a change, read
pre-care and complete their skin/skincare/health questionnaire. Staff can also
use **Send confirmation now** on the appointment; SMS consent is required.
Start service requires assigned staff and Heidi recording confirmation. End
service requires a completion comment; before/after photos remain optional.
After completion each appointment displays its own after-care QR link. It uses
a separate random token, exposes only care guidance, and cannot access the
customer's health form. The current QR renderer is api.qrserver.com. Unknown
services receive a clinician-directed general care guide; approve any new
service-specific medical instructions with the treating clinic before adding them.

Before production activation, run `npm test`, deploy, verify cron registration,
and use a designated test client with SMS consent. Check the outbox's provider
message ID, open the received link, submit the questionnaire, confirm, start
and end the test appointment, and scan its after-care QR. Do not run the cron
against production as a smoke test unless sending all currently eligible
customer messages is intended. The local automated SQL tests use isolated
PostgreSQL (PGlite), never the live database or SMS provider.
