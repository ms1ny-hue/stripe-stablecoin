import { NextResponse } from "next/server";
import { getMarketSnapshot } from "@/lib/feeds";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const revalidate = 30;

export async function GET() {
  const [market, stripeData] = await Promise.all([
    getMarketSnapshot(),
    getStripeSnapshot(),
  ]);
  return NextResponse.json(
    { market, stripe: stripeData },
    { headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=60" } },
  );
}

async function getStripeSnapshot() {
  try {
    const stripe = getStripe();
    const [balance, intents] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.paymentIntents.list({ limit: 5 }),
    ]);
    const available = balance.available.reduce((sum, b) => sum + b.amount, 0);
    const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0);
    return {
      live: true as const,
      availableUsd: available / 100,
      pendingUsd: pending / 100,
      recent: intents.data.map((p) => ({
        id: p.id,
        amount: p.amount / 100,
        currency: p.currency,
        status: p.status,
        created: p.created,
      })),
    };
  } catch {
    return { live: false as const, availableUsd: 0, pendingUsd: 0, recent: [] };
  }
}
