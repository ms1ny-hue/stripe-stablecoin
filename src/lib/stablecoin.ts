/**
 * Stablecoin money math. Pure, immutable, integer-safe.
 *
 * USDC has 6 decimals on-chain. Fiat USD is tracked in integer cents to avoid
 * float drift. All conversions go through integer base units, never JS floats
 * on money.
 */

/** USDC smallest unit exponent (1 USDC = 10^6 base units). */
export const USDC_DECIMALS = 6;

/** Fiat tracked in cents. */
export const USD_CENTS = 2;

/** A monetary amount expressed in integer base units of an asset. */
export interface Money {
  readonly baseUnits: bigint;
  readonly asset: "USD" | "USDC";
}

const POW10 = (n: number): bigint => 10n ** BigInt(n);

/** Build a USD Money from a decimal string like "100.00". No float involved. */
export function usd(amount: string): Money {
  return { baseUnits: parseDecimal(amount, USD_CENTS), asset: "USD" };
}

/** Build a USDC Money from a decimal string like "100.000000". */
export function usdc(amount: string): Money {
  return { baseUnits: parseDecimal(amount, USDC_DECIMALS), asset: "USDC" };
}

/**
 * Convert USD cents <-> USDC base units at a 1:1 peg.
 * Returns a NEW Money; never mutates input.
 */
export function pegConvert(m: Money): Money {
  if (m.asset === "USD") {
    const scaled = (m.baseUnits * POW10(USDC_DECIMALS)) / POW10(USD_CENTS);
    return { baseUnits: scaled, asset: "USDC" };
  }
  const scaled = (m.baseUnits * POW10(USD_CENTS)) / POW10(USDC_DECIMALS);
  return { baseUnits: scaled, asset: "USD" };
}

/**
 * Apply a fee in basis points (1 bp = 0.01%). Rounds down (favoring the payer).
 * Returns { net, fee } as new Money objects.
 */
export function applyFeeBps(
  m: Money,
  bps: number,
): { readonly net: Money; readonly fee: Money } {
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) {
    throw new RangeError(`bps must be an integer in [0, 10000], got ${bps}`);
  }
  const fee = (m.baseUnits * BigInt(bps)) / 10_000n;
  return {
    fee: { baseUnits: fee, asset: m.asset },
    net: { baseUnits: m.baseUnits - fee, asset: m.asset },
  };
}

/** Format a Money back to a fixed-decimal display string. */
export function format(m: Money): string {
  const decimals = m.asset === "USD" ? USD_CENTS : USDC_DECIMALS;
  const divisor = POW10(decimals);
  const whole = m.baseUnits / divisor;
  const frac = (m.baseUnits % divisor).toString().padStart(decimals, "0");
  return `${whole}.${frac}`;
}

function parseDecimal(amount: string, decimals: number): bigint {
  if (!/^\d+(\.\d+)?$/.test(amount)) {
    throw new TypeError(`invalid money string: ${amount}`);
  }
  const [whole, frac = ""] = amount.split(".");
  if (frac.length > decimals) {
    throw new RangeError(`too many decimal places for ${decimals}-dp asset`);
  }
  const padded = frac.padEnd(decimals, "0");
  return BigInt(whole) * POW10(decimals) + BigInt(padded);
}
