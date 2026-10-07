import pool from "./db";

/**
 * Schema additions this version of the app depends on. Every statement is
 * idempotent, so it is safe to run on every cold start; it only executes
 * when the newest column is missing.
 *
 * - vehicle_images: photo storage in Postgres (replaces the S3 bucket).
 * - bookings.stripe_*: makes the Stripe webhook idempotent and lets
 *   cancellations issue refunds.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS vehicle_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  data bytea NOT NULL,
  byte_size integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount numeric(10, 2);

CREATE UNIQUE INDEX IF NOT EXISTS bookings_stripe_session_id_key
  ON bookings (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS bookings_car_dates_idx
  ON bookings (car_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings (user_id);
`;

let ready: Promise<void> | null = null;

async function migrate() {
  const { rows } = await pool.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = current_schema()
         AND table_name = 'bookings' AND column_name = 'refund_amount'
     ) AND to_regclass('vehicle_images') IS NOT NULL AS ok`
  );
  if (rows[0]?.ok) return;
  await pool.query(SCHEMA_SQL);
}

/** Ensures the schema additions exist. Runs at most once per server instance. */
export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = migrate().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}
