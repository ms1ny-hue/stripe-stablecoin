/**
 * Stablecoin payout settlement model.
 *
 * Models how a platform pays out a seller/contractor in USDC instead of via
 * ACH/wire: prefunded USDC float settles in seconds, priced as a platform fee
 * plus an optional FX spread for local-currency delivery, plus a network fee.
 * Everything routes through integer base units in `stablecoin.ts`.
 *
 * When a live market snapshot is supplied (USDC peg, on-chain gas, FX rate) the
 * quote uses real numbers. With no live data it falls back to peg 1.0, a one
 * cent network fee, and no local-currency conversion.
 */
import { type Money, applyFeeBps, format, pegConvert, usd } from "./stablecoin";

/** Default flat on-chain cost when no live gas feed is supplied. */
const DEFAULT_NETWORK_FEE_USD = 0.01;

/** Baseline rails we compare against (the status quo this displaces). */
export const BASELINES = {
  ach: { label: "ACH", feeUsd: usd("0.25"), settlementSeconds: 2 * 86_400 },
  wire: { label: "Domestic wire", feeUsd: usd("25.00"), settlementSeconds: 86_400 },
  intlWire: {
    label: "International wire",
    feeUsd: usd("45.00"),
    settlementSeconds: 3 * 86_400,
  },
} as const;

export type BaselineKey = keyof typeof BASELINES;

/** Live market inputs. All optional; each defaults to a neutral value. */
export interface LiveParams {
  /** USDC price in USD, e.g. 0.9997. Default 1. */
  readonly pegUsd?: number;
  /** Modeled on-chain cost of one transfer, in USD. Default 0.01. */
  readonly networkFeeUsd?: number;
  /** Mid-market FX rate USD -> local for the destination currency. */
  readonly fxRate?: number;
  /** Destination local currency code, paired with fxRate. */
  readonly localCurrency?: string;
}

export interface PayoutInput {
  /** Gross amount the platform pays, as a USD decimal string e.g. "1000.00". */
  readonly amountUsd: string;
  /** Platform take, basis points (1 bp = 0.01%). */
  readonly platformFeeBps: number;
  /** FX spread for local-currency delivery, basis points. 0 = pay in USDC. */
  readonly fxSpreadBps: number;
  /** Instant rail (seconds) vs batched (minutes). */
  readonly instant: boolean;
  /** Live market snapshot. Omit for neutral defaults. */
  readonly live?: LiveParams;
}

export interface LocalAmount {
  readonly value: number;
  readonly currency: string;
}

export interface PayoutQuote {
  readonly gross: Money;
  readonly settledUsdc: Money;
  readonly platformFee: Money;
  readonly fxSpread: Money;
  readonly networkFee: Money;
  readonly net: Money;
  readonly effectiveCostBps: number;
  readonly settlementSeconds: number;
  readonly pegUsd: number;
  readonly pegDeviationBps: number;
  readonly localAmount: LocalAmount | null;
}

function sub(a: Money, b: Money): Money {
  if (a.asset !== b.asset) throw new TypeError("asset mismatch");
  return { baseUnits: a.baseUnits - b.baseUnits, asset: a.asset };
}

function usdcFromUsd(amountUsd: number): Money {
  return { baseUnits: BigInt(Math.round(amountUsd * 1e6)), asset: "USDC" };
}

/** Produce a fully-itemized payout quote. Pure; never mutates inputs. */
export function quotePayout(input: PayoutInput): PayoutQuote {
  const pegUsd = input.live?.pegUsd && input.live.pegUsd > 0 ? input.live.pegUsd : 1;
  const networkFeeUsd = input.live?.networkFeeUsd ?? DEFAULT_NETWORK_FEE_USD;

  const gross = usd(input.amountUsd);
  // At the peg, $1 buys 1/peg USDC. peg=1 -> identical to a 1:1 conversion.
  const settledUsdc =
    pegUsd === 1
      ? pegConvert(gross)
      : usdcFromUsd(Number(gross.baseUnits) / 100 / pegUsd);

  const { fee: platformFee, net: afterPlatform } = applyFeeBps(
    settledUsdc,
    input.platformFeeBps,
  );
  const { fee: fxSpread, net: afterFx } = applyFeeBps(
    afterPlatform,
    input.fxSpreadBps,
  );
  const networkFee = usdcFromUsd(networkFeeUsd);
  const net = sub(afterFx, networkFee);

  const totalCost =
    platformFee.baseUnits + fxSpread.baseUnits + networkFee.baseUnits;
  const effectiveCostBps =
    settledUsdc.baseUnits === 0n
      ? 0
      : Number((totalCost * 10_000n) / settledUsdc.baseUnits);

  let localAmount: LocalAmount | null = null;
  if (input.live?.fxRate && input.live.localCurrency) {
    const netUsd = (Number(net.baseUnits) / 1e6) * pegUsd;
    localAmount = {
      value: netUsd * input.live.fxRate,
      currency: input.live.localCurrency,
    };
  }

  return {
    gross,
    settledUsdc,
    platformFee,
    fxSpread,
    networkFee,
    net,
    effectiveCostBps,
    settlementSeconds: input.instant ? 5 : 90,
    pegUsd,
    pegDeviationBps: Math.round((pegUsd - 1) * 10_000),
    localAmount,
  };
}

export interface BaselineComparison {
  readonly baseline: BaselineKey;
  readonly label: string;
  readonly feeUsd: string;
  readonly stablecoinCostUsd: string;
  readonly fasterBy: string;
}

/** Compare a quote against a legacy rail. Drives the "why this matters" panel. */
export function compareToBaseline(
  quote: PayoutQuote,
  baseline: BaselineKey,
): BaselineComparison {
  const b = BASELINES[baseline];
  const stablecoinCost =
    quote.platformFee.baseUnits +
    quote.fxSpread.baseUnits +
    quote.networkFee.baseUnits;
  return {
    baseline,
    label: b.label,
    feeUsd: format(b.feeUsd),
    // USDC has 6dp; show the cost in dollars at the 1:1 peg.
    stablecoinCostUsd: format({ baseUnits: stablecoinCost, asset: "USDC" }),
    fasterBy: humanizeSeconds(b.settlementSeconds - quote.settlementSeconds),
  };
}

export function humanizeSeconds(s: number): string {
  if (s <= 0) return "no faster";
  if (s < 90) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86_400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86_400)} days`;
}
