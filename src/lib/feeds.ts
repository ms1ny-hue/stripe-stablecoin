import "server-only";

/**
 * Live market data feeds. All free public APIs, no keys. Each fetcher has a
 * short timeout and a typed fallback so a single dead upstream never breaks the
 * payout path. Aggregated by getMarketSnapshot().
 */

export interface FxRates {
  readonly base: "USD";
  readonly rates: Record<string, number>;
  readonly asOf: string;
  readonly source: string;
  readonly live: boolean;
}

export interface CryptoSnapshot {
  readonly usdcUsd: number;
  readonly usdc24h: number;
  readonly ethUsd: number;
  readonly eth24h: number;
  readonly pegDeviationBps: number;
  readonly source: string;
  readonly live: boolean;
}

export interface GasSnapshot {
  readonly chain: "Base";
  readonly gasGwei: number;
  readonly ethUsd: number;
  /** Modeled cost of one ERC-20 (USDC) transfer in USD. */
  readonly transferUsd: number;
  readonly source: string;
  readonly live: boolean;
}

export interface MarketSnapshot {
  readonly fx: FxRates;
  readonly crypto: CryptoSnapshot;
  readonly gas: GasSnapshot;
  readonly fetchedAt: string;
}

/** Approx gas for an ERC-20 transfer. */
const ERC20_TRANSFER_GAS = 65_000;

async function getJson(url: string, ms = 4_000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      next: { revalidate: 30 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function getFx(): Promise<FxRates> {
  try {
    const j = (await getJson("https://open.er-api.com/v6/latest/USD")) as {
      result: string;
      rates: Record<string, number>;
      time_last_update_utc: string;
    };
    if (j.result !== "success") throw new Error("fx result not success");
    return {
      base: "USD",
      rates: j.rates,
      asOf: j.time_last_update_utc,
      source: "open.er-api.com (ECB-derived)",
      live: true,
    };
  } catch {
    return {
      base: "USD",
      rates: { MXN: 17.2, NGN: 1360, PHP: 60.7, BRL: 5.08, EUR: 0.86 },
      asOf: "fallback",
      source: "fallback",
      live: false,
    };
  }
}

export async function getCrypto(): Promise<CryptoSnapshot> {
  try {
    const j = (await getJson(
      "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,ethereum&vs_currencies=usd&include_24hr_change=true",
    )) as Record<string, { usd: number; usd_24h_change: number }>;
    const usdc = j["usd-coin"].usd;
    return {
      usdcUsd: usdc,
      usdc24h: j["usd-coin"].usd_24h_change,
      ethUsd: j.ethereum.usd,
      eth24h: j.ethereum.usd_24h_change,
      pegDeviationBps: Math.round((usdc - 1) * 10_000),
      source: "CoinGecko",
      live: true,
    };
  } catch {
    return {
      usdcUsd: 1,
      usdc24h: 0,
      ethUsd: 1700,
      eth24h: 0,
      pegDeviationBps: 0,
      source: "fallback",
      live: false,
    };
  }
}

export async function getGas(ethFallback: number): Promise<GasSnapshot> {
  try {
    const j = (await getJson("https://base.blockscout.com/api/v2/stats")) as {
      coin_price: string;
      gas_prices: { average: number; fast: number; slow: number };
    };
    const gwei = j.gas_prices.average;
    const eth = Number(j.coin_price) || ethFallback;
    const transferUsd = gwei * 1e-9 * ERC20_TRANSFER_GAS * eth;
    return {
      chain: "Base",
      gasGwei: gwei,
      ethUsd: eth,
      transferUsd,
      source: "Blockscout (Base)",
      live: true,
    };
  } catch {
    return {
      chain: "Base",
      gasGwei: 0.02,
      ethUsd: ethFallback,
      transferUsd: 0.02 * 1e-9 * ERC20_TRANSFER_GAS * ethFallback,
      source: "fallback",
      live: false,
    };
  }
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const [fx, crypto] = await Promise.all([getFx(), getCrypto()]);
  const gas = await getGas(crypto.ethUsd);
  return { fx, crypto, gas, fetchedAt: new Date().toISOString() };
}
