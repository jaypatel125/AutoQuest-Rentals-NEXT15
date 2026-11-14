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
| `REVIEWER_DEMO` | no | Set to `off` to hide and disable the public reviewer login |
| `REVIEWER_DEMO_EMAIL`, `REVIEWER_DEMO_PASSWORD` | no | Reviewer login shown on the site (defaults below) |

### Testing payments

With a Stripe test key, the checkout page shows the test card details next
to the pay button. Use card `4242 4242 4242 4242`, any future expiry, any
CVC and any postal code. No real charge is made.

## Roles

| Role | Can do |
| --- | --- |
| Customer | Book cars, manage their own bookings and rewards |
| Reviewer | Open every admin page read-only. Every write is refused by the API, customer names and emails are partly hidden, and the account's own profile, password and sessions can't be changed |
| Admin | Everything, including assigning roles from Admin > Customers |

### Public reviewer demo

The sign-in page, the home page and the footer show a shared reviewer login
so anyone can look around the admin area. The account is created on first
visit to the sign-in page, and its role and password are put back if they
drift. Defaults: `reviewer@example.com` / `Reviewer123!` (example.com can
never receive email, so nobody can take the account over). Change them with
`REVIEWER_DEMO_EMAIL` and `REVIEWER_DEMO_PASSWORD`, or turn the demo off
with `REVIEWER_DEMO=off`. Banning the account from Admin > Customers also
locks it.

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
