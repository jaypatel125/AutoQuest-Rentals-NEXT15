import Stripe from "stripe";

let client: Stripe | null = null;

/** Returns a Stripe client, or null when STRIPE_SECRET_KEY is not set. */
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    });
  }
  return client;
}
