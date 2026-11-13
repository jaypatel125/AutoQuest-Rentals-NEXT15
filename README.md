# AutoQuest Rentals

Car rental platform built with Next.js 15. Customers search by city and
dates, compare cars by price and Green Score, pay with Stripe, and earn
reward points (double on electric vehicles). Admins manage branches,
vehicles, bookings and customers and see fleet analytics.

## Stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- PostgreSQL via `pg` (vehicle photos are stored in the database too)
- better-auth (email + optional Google sign-in, admin roles)
- Stripe Checkout + webhooks, Nodemailer for transactional email
- Jest + Testing Library, Playwright for end-to-end tests

## Getting started

```bash
npm install
cp .env.example .env.local   # or create it from the table below
npm run dev
```

The app creates the extra tables and columns it needs on first use.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | yes | Session signing secret |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` | yes | Public URL of the site |
| `STRIPE_SECRET_KEY` | yes | `sk_test_...` shows the test-card helper at checkout |
| `STRIPE_WEBHOOK_SECRET` | yes | Webhook signing secret (`checkout.session.completed`) |
| `CRON_SECRET` | yes | Protects the booking-completion cron route |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | for email | Outgoing mail |
| `SMTP_FROM`, `SUPPORT_EMAIL` | no | Sender and contact-form inbox |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | no | Enables "Continue with Google" |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | no | Set to `false` only if your host needs it |

### Testing payments

With a Stripe test key, the checkout page shows the test card details next
to the pay button. Use card `4242 4242 4242 4242`, any future expiry, any
CVC and any postal code. No real charge is made.

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm test           # unit and component tests
npx playwright test  # browser tests (set EMAIL, PASSWORD and optionally E2E_CITY)
```

## Vehicle photos

Admins upload photos from the vehicle form; they are resized in the browser
and stored in Postgres. When a vehicle has no uploaded photo, the site falls
back to a bundled stock photo for that model (Wikimedia Commons, credited on
the terms page) or an illustration of the body type.
