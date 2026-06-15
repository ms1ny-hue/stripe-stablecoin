import "server-only";
import Stripe from "stripe";

/**
 * Lazily-constructed server-side Stripe client.
 *
 * IMPORTANT: do not throw at module load. Next.js evaluates route modules
 * during `next build` ("collecting page data"), so throwing here fails the whole
 * build on any environment that lacks the key (previews, CI). Instead we throw
 * only when a request actually needs Stripe, which the route handlers catch.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add a test-mode key to the environment.",
    );
  }
  if (!client) client = new Stripe(key);
  return client;
}

/** True only for live keys; this project expects test mode. */
export function isLiveKey(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_");
}

/** Build a test-mode dashboard link. */
export function dashboardUrl(objectPath: string): string {
  return `https://dashboard.stripe.com/test/${objectPath}`;
}
