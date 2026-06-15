import { NextResponse } from "next/server";
import { z } from "zod";
import { format } from "@/lib/stablecoin";
import { compareToBaseline, quotePayout } from "@/lib/payout";
import { getMarketSnapshot } from "@/lib/feeds";
import { getStripe, isLiveKey, dashboardUrl } from "@/lib/stripe";

export const runtime = "nodejs";

const Body = z.object({
  amountUsd: z.string().regex(/^\d+(\.\d{1,2})?$/),
  platformFeeBps: z.number().int().min(0).max(1_000),
  fxSpreadBps: z.number().int().min(0).max(10_000),
  instant: z.boolean(),
  destinationCurrency: z.string().min(3).max(4),
  baseline: z.enum(["ach", "wire", "intlWire"]),
});

export async function POST(req: Request) {
  if (isLiveKey()) {
    return NextResponse.json(
      { error: "Refusing to run against a live key. Use a test-mode key." },
      { status: 400 },
    );
  }

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request", detail: messageOf(err) },
      { status: 422 },
    );
  }

  // Live market snapshot drives the real peg, on-chain gas, and FX rate.
  const market = await getMarketSnapshot();
  const fxRate =
    parsed.destinationCurrency === "USDC"
      ? undefined
      : market.fx.rates[parsed.destinationCurrency];

  const quote = quotePayout({
    amountUsd: parsed.amountUsd,
    platformFeeBps: parsed.platformFeeBps,
    fxSpreadBps: parsed.fxSpreadBps,
    instant: parsed.instant,
    live: {
      pegUsd: market.crypto.usdcUsd,
      networkFeeUsd: market.gas.transferUsd,
      fxRate,
      localCurrency: fxRate ? parsed.destinationCurrency : undefined,
    },
  });
  const comparison = compareToBaseline(quote, parsed.baseline);

  try {
    // A real Stripe object in test mode: a USDC (pay-with-crypto) PaymentIntent
    // representing the settlement leg. Amount is the gross, in integer cents.
    const intent = await getStripe().paymentIntents.create({
      amount: Number(quote.gross.baseUnits),
      currency: "usd",
      payment_method_types: ["crypto"],
      description: `Stablecoin payout settlement → ${parsed.destinationCurrency}`,
      metadata: {
        product: "stablecoin-payouts-demo",
        gross_usd: format(quote.gross),
        settled_usdc: format(quote.settledUsdc),
        platform_fee_usdc: format(quote.platformFee),
        fx_spread_usdc: format(quote.fxSpread),
        network_fee_usdc: format(quote.networkFee),
        net_usdc: format(quote.net),
        effective_cost_bps: String(quote.effectiveCostBps),
        destination_currency: parsed.destinationCurrency,
        rail: parsed.instant ? "instant" : "batched",
      },
    });

    return NextResponse.json({
      quote: {
        net: format(quote.net),
        gross: format(quote.gross),
        effectiveCostBps: quote.effectiveCostBps,
        settlementSeconds: quote.settlementSeconds,
        fasterBy: comparison.fasterBy,
        baselineLabel: comparison.label,
        pegUsd: quote.pegUsd,
        pegDeviationBps: quote.pegDeviationBps,
        localAmount: quote.localAmount,
      },
      market: {
        usdcUsd: market.crypto.usdcUsd,
        ethUsd: market.crypto.ethUsd,
        gasGwei: market.gas.gasGwei,
        networkFeeUsd: market.gas.transferUsd,
        fxRate,
        fxAsOf: market.fx.asOf,
        sources: {
          fx: market.fx.source,
          crypto: market.crypto.source,
          gas: market.gas.source,
        },
      },
      stripe: {
        id: intent.id,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        livemode: intent.livemode,
        dashboardUrl: dashboardUrl(`payments/${intent.id}`),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Stripe call failed", detail: messageOf(err) },
      { status: 502 },
    );
  }
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}
