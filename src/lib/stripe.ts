import "server-only";
import Stripe from "stripe";

/**
 * Server-side Stripe client. Reads the test-mode secret from the environment.
 * Never import this from a client component.
 */
const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Add a test-mode key to .env.local " +
      "(and to the Vercel project env for production).",
  );
}

export const stripe = new Stripe(key);

/** True only for live keys; this project expects test mode. */
export const isLiveKey = key.startsWith("sk_live_");

/** Account id is embedded in the key; used to build dashboard links. */
export function dashboardUrl(objectPath: string): string {
  return `https://dashboard.stripe.com/test/${objectPath}`;
}
