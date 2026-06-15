/**
 * Stablecoin payout settlement model.
 *
 * Models how a platform pays out a seller/contractor in USDC instead of via
 * ACH/wire: prefunded USDC float settles in seconds, priced as a platform fee
 * plus an optional FX spread for local-currency delivery, plus a flat network
 * fee. Everything routes through integer base units in `stablecoin.ts`.
 *
 * Numbers here are SIMULATED for demonstration. Real settlement would call the
 * payments + chain APIs (see `settle()` stub).
 */
import {
  type Money,
  applyFeeBps,
  format,
  pegConvert,
  usd,
  usdc,
} from "./stablecoin";

/** Flat on-chain cost per payout, modeled at ~1 cent. */
const NETWORK_FEE = usdc("0.010000");

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

export interface PayoutInput {
  /** Gross amount the platform pays, as a USD decimal string e.g. "1000.00". */
  readonly amountUsd: string;
  /** Platform take, basis points (1 bp = 0.01%). */
  readonly platformFeeBps: number;
  /** FX spread for local-currency delivery, basis points. 0 = pay in USDC. */
  readonly fxSpreadBps: number;
  /** Instant rail (seconds) vs batched (minutes). */
  readonly instant: boolean;
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
}

function sub(a: Money, b: Money): Money {
  if (a.asset !== b.asset) throw new TypeError("asset mismatch");
  return { baseUnits: a.baseUnits - b.baseUnits, asset: a.asset };
}

/** Produce a fully-itemized payout quote. Pure; never mutates inputs. */
export function quotePayout(input: PayoutInput): PayoutQuote {
  const gross = usd(input.amountUsd);
  const settledUsdc = pegConvert(gross);

  const { fee: platformFee, net: afterPlatform } = applyFeeBps(
    settledUsdc,
    input.platformFeeBps,
  );
  const { fee: fxSpread, net: afterFx } = applyFeeBps(
    afterPlatform,
    input.fxSpreadBps,
  );
  const net = sub(afterFx, NETWORK_FEE);

  const totalCost =
    platformFee.baseUnits + fxSpread.baseUnits + NETWORK_FEE.baseUnits;
  const effectiveCostBps =
    settledUsdc.baseUnits === 0n
      ? 0
      : Number((totalCost * 10_000n) / settledUsdc.baseUnits);

  return {
    gross,
    settledUsdc,
    platformFee,
    fxSpread,
    networkFee: NETWORK_FEE,
    net,
    effectiveCostBps,
    settlementSeconds: input.instant ? 5 : 90,
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
