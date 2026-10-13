# Deployment

This repository is connected to the Vercel `venux` project. Commits to `main` trigger production deployments.

## Appointment confirmation and care workflow

Production requires `DATABASE_URL`, `CLICKSEND_USERNAME`, `CLICKSEND_API_KEY`,
`CRON_SECRET` and `NEXT_PUBLIC_SITE_URL` (the production HTTPS origin). Keep
credentials in Vercel environment settings, never in the repository. Redeploy
when changing Vercel environment variables. `CLICKSEND_FROM` is optional; omit
it to use ClickSend's default sender rather than an unverified sender number.

This project uses Vercel Hobby, so `vercel.json` retains only the existing
once-daily birthday task. Appointment confirmations need an external scheduler.
For example, configure a free cron-job.org job with:

- URL: `https://venux-three.vercel.app/api/cron/appointment-confirmations`
- Method: GET; interval: every five minutes; job enabled.
- Request header: `Authorization: Bearer <CRON_SECRET>` using the same secret
  configured in Vercel Production. Keep the value private; do not use URL parameters.
- Enable failure notifications and check successful execution history.

Create `CRON_SECRET` securely in Vercel Production, set `NEXT_PUBLIC_SITE_URL` to
`https://venux-three.vercel.app`, and configure the database and ClickSend
credentials there. Redeploy before enabling the scheduler. On first activation
the endpoint sends ALL consenting, eligible appointments in the next 24 hours,
including existing bookings. For a live test, first use a designated isolated
test database/deployment, or review the eligible production bookings before
activating. External cron requests are not enabled by a repository change.
Do not manually call the production cron just to check connectivity: an
authenticated call triggers real SMS. Unauthenticated requests must return 401.
If moving to Pro later, Vercel can schedule the same endpoint with
`*/5 * * * *`; run only one scheduler. External scheduling can be delayed and
does not guarantee delivery at the exact second of the 24-hour boundary.
The existing once-daily birthday task stays separate.

The scheduler calculates the appointment instant in Australia/Sydney, including
DST. Consenting clients with confirmed future appointments get a confirmation
when the start is at most 24 hours away, normally within five minutes of the
24-hour boundary. Late-created bookings are sent on the next run. Downtime may
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
