"use client";

import { useEffect, useMemo, useState } from "react";
import { type BaselineKey, compareToBaseline, quotePayout } from "@/lib/payout";

interface Destination {
  readonly code: string;
  readonly label: string;
  readonly currency: string;
}

const DESTINATIONS: readonly Destination[] = [
  { code: "US", label: "United States", currency: "USDC" },
  { code: "MX", label: "Mexico", currency: "MXN" },
  { code: "NG", label: "Nigeria", currency: "NGN" },
  { code: "PH", label: "Philippines", currency: "PHP" },
  { code: "BR", label: "Brazil", currency: "BRL" },
];

const BASELINE_FOR = (d: Destination): BaselineKey =>
  d.code === "US" ? "ach" : "intlWire";

interface Live {
  pegUsd: number;
  networkFeeUsd: number;
  rates: Record<string, number>;
}

interface PayoutResult {
  readonly stripe: {
    readonly id: string;
    readonly status: string;
    readonly amount: number;
    readonly currency: string;
    readonly dashboardUrl: string;
  };
  readonly quote: { readonly net: string };
  readonly market: { readonly usdcUsd: number; readonly networkFeeUsd: number };
}

export function PayoutConsole() {
  const [amount, setAmount] = useState(1000);
  const [platformFeeBps, setPlatformFeeBps] = useState(50);
  const [fxSpreadBps, setFxSpreadBps] = useState(75);
  const [dest, setDest] = useState<Destination>(DESTINATIONS[1]);
  const [instant, setInstant] = useState(true);
  const [live, setLive] = useState<Live | null>(null);
  const [result, setResult] = useState<PayoutResult | null>(null);
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // pull the same live snapshot the API uses, so the preview is live too
  useEffect(() => {
    let alive = true;
    async function pull() {
      try {
        const res = await fetch("/api/feeds", { cache: "no-store" });
        const d = await res.json();
        if (!alive) return;
        setLive({
          pegUsd: d.market.crypto.usdcUsd,
          networkFeeUsd: d.market.gas.transferUsd,
          rates: d.market.fx.rates,
        });
      } catch {
        /* keep defaults */
      }
    }
    pull();
    const id = setInterval(pull, 20_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const fxRate = dest.currency === "USDC" ? undefined : live?.rates[dest.currency];

  const quote = useMemo(
    () =>
      quotePayout({
        amountUsd: amount.toFixed(2),
        platformFeeBps,
        fxSpreadBps: dest.currency === "USDC" ? 0 : fxSpreadBps,
        instant,
        live: live
          ? {
              pegUsd: live.pegUsd,
              networkFeeUsd: live.networkFeeUsd,
              fxRate,
              localCurrency: fxRate ? dest.currency : undefined,
            }
          : undefined,
      }),
    [amount, platformFeeBps, fxSpreadBps, dest, instant, live, fxRate],
  );

  const comparison = useMemo(
    () => compareToBaseline(quote, BASELINE_FOR(dest)),
    [quote, dest],
  );

  function reset() {
    setResult(null);
    setError(null);
    setSettling(false);
  }

  async function onSettle() {
    setSettling(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/payout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amountUsd: amount.toFixed(2),
          platformFeeBps,
          fxSpreadBps: dest.currency === "USDC" ? 0 : fxSpreadBps,
          instant,
          destinationCurrency: dest.currency,
          baseline: BASELINE_FOR(dest),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data as PayoutResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Settlement failed");
    } finally {
      setSettling(false);
    }
  }

  const isUsdc = dest.currency === "USDC";

  return (
    <div className="panel" style={{ overflow: "hidden" }}>
      <div className="console-grid">
        {/* ---- controls ---- */}
        <section
          style={{
            display: "grid",
            gap: "1.7rem",
            padding: "clamp(1.25rem,3vw,1.9rem)",
            borderRight: "1px solid var(--line)",
            alignContent: "start",
          }}
        >
          <Field label="Payout amount" hint="What the platform sends">
            <div className="num" style={{ fontSize: "1.9rem", color: "var(--text)" }}>
              <span style={{ color: "var(--text-3)" }}>$</span>
              {displayFrom(quote.gross)}
            </div>
            <Range min={50} max={25000} step={50} value={amount} onChange={(v) => { reset(); setAmount(v); }} label="Payout amount" />
          </Field>

          <Field label="Destination" hint="Where the seller is paid">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {DESTINATIONS.map((d) => (
                <button key={d.code} onClick={() => { reset(); setDest(d); }} style={chip(d.code === dest.code)} className="ring">
                  {d.label}
                  <span className="num" style={{ opacity: 0.55, marginLeft: 6, fontSize: "0.72rem" }}>{d.currency}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Platform fee · ${(platformFeeBps / 100).toFixed(2)}%`} hint="Your take rate, the revenue line">
            <Range min={0} max={300} step={5} value={platformFeeBps} onChange={(v) => { reset(); setPlatformFeeBps(v); }} label="Platform fee bps" />
          </Field>

          {!isUsdc && (
            <Field label={`FX spread · ${(fxSpreadBps / 100).toFixed(2)}%`} hint="Spread on local-currency delivery">
              <Range min={0} max={250} step={5} value={fxSpreadBps} onChange={(v) => { reset(); setFxSpreadBps(v); }} label="FX spread bps" />
            </Field>
          )}

          <Field label="Rail" hint="Instant draws the prefunded USDC float">
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { reset(); setInstant(true); }} style={chip(instant)} className="ring">Instant</button>
              <button onClick={() => { reset(); setInstant(false); }} style={chip(!instant)} className="ring">Batched</button>
            </div>
          </Field>
        </section>

        {/* ---- quote + settle ---- */}
        <section style={{ display: "grid", gap: "1.1rem", padding: "clamp(1.25rem,3vw,1.9rem)", alignContent: "start" }}>
          <div style={{ borderLeft: "2px solid var(--iris)", paddingLeft: "1rem" }}>
            <div className="label">Seller receives</div>
            <div className="num" style={{ fontSize: "2.2rem", marginTop: 4, color: "var(--text)" }}>
              {displayFrom(quote.net)}
              <span style={{ fontSize: "0.95rem", color: "var(--text-3)", marginLeft: 8 }}>USDC</span>
            </div>
            {quote.localAmount && (
              <div className="num" style={{ color: "var(--text-2)", fontSize: "0.95rem", marginTop: 2 }}>
                ≈ {quote.localAmount.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} {quote.localAmount.currency}
                <span style={{ color: "var(--text-3)", marginLeft: 6, fontSize: "0.72rem" }}>at live mid-market</span>
              </div>
            )}
          </div>

          <Itemize quote={quote} live={!!live} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: "0.9rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>
              vs {comparison.label}{" "}
              <span className="num" style={{ color: "var(--pos)" }}>{comparison.fasterBy} faster</span>
            </div>
            {result ? (
              <button onClick={reset} style={btn(false)} className="ring">New payout</button>
            ) : (
              <button onClick={onSettle} disabled={settling} style={btn(true)} className="ring">
                {settling ? "Creating…" : "Create in Stripe →"}
              </button>
            )}
          </div>

          {error && <div role="alert" style={errBox}>{error}</div>}
          {result && <ResultCard result={result} currency={dest.currency} />}
        </section>
      </div>

      <style>{`
        .console-grid { display:grid; grid-template-columns:1fr; }
        @media (min-width:880px){ .console-grid { grid-template-columns:1fr 1fr; } }
      `}</style>
    </div>
  );
}

/* ---- subcomponents ---- */

function Itemize({ quote, live }: { quote: ReturnType<typeof quotePayout>; live: boolean }) {
  const rows: Array<[string, string, string?]> = [
    ["USD in", `$${displayFrom(quote.gross)}`],
    ["Settled to USDC", `${displayFrom(quote.settledUsdc)}`, live ? `peg ${quote.pegUsd.toFixed(4)}` : undefined],
    ["Platform fee", `−${displayFrom(quote.platformFee)}`],
  ];
  if (quote.fxSpread.baseUnits > 0n) rows.push(["FX spread", `−${displayFrom(quote.fxSpread)}`]);
  const networkUsd = Number(quote.networkFee.baseUnits) / 1e6;
  const networkStr = networkUsd < 0.01 ? `−${networkUsd.toFixed(4)}` : `−${displayFrom(quote.networkFee)}`;
  rows.push(["Network fee", networkStr, live ? "live gas" : undefined]);

  return (
    <dl style={{ margin: 0 }}>
      {rows.map(([k, v, note]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.45rem 0", borderBottom: "1px solid var(--line)", fontSize: "0.85rem" }}>
          <dt style={{ color: "var(--text-2)" }}>
            {k}
            {note && <span className="label" style={{ marginLeft: 8, color: "var(--text-3)" }}>{note}</span>}
          </dt>
          <dd className="num" style={{ margin: 0, color: "var(--text)" }}>{v}</dd>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.6rem", fontSize: "0.85rem" }}>
        <dt style={{ color: "var(--text-2)" }}>All-in cost</dt>
        <dd className="num" style={{ margin: 0, color: "var(--iris-bright)" }}>{(quote.effectiveCostBps / 100).toFixed(2)}%</dd>
      </div>
    </dl>
  );
}

function ResultCard({ result, currency }: { result: PayoutResult; currency: string }) {
  const s = result.stripe;
  return (
    <div className="rise" style={{ border: "1px solid var(--line-2)", borderRadius: 10, padding: "0.9rem 1rem", background: "var(--bg-2)" }}>
      <div className="label" style={{ color: "var(--pos)" }}>● Stripe object created · test mode</div>
      <div style={{ display: "grid", gap: 5, marginTop: 8, fontSize: "0.8rem" }}>
        <Row k="PaymentIntent" v={s.id} mono />
        <Row k="Status" v={s.status} mono />
        <Row k="Amount" v={`${(s.amount / 100).toFixed(2)} ${s.currency.toUpperCase()}`} mono />
        <Row k="USDC peg used" v={result.market.usdcUsd.toFixed(4)} mono />
        <Row k="Net to seller" v={`${result.quote.net} USDC → ${currency}`} mono />
      </div>
      <a href={s.dashboardUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 9, fontSize: "0.78rem", color: "var(--iris-bright)" }}>
        View in Stripe Dashboard →
      </a>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "var(--text-3)" }}>{k}</span>
      <span className={mono ? "num" : ""} style={{ color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 9 }}>
      <div>
        <div className="label" style={{ color: "var(--text-2)" }}>{label}</div>
        <div style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: 2 }}>{hint}</div>
      </div>
      {children}
    </div>
  );
}

function Range({ min, max, step, value, onChange, label }: { min: number; max: number; step: number; value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
      className="ring"
      style={{ width: "100%", accentColor: "var(--iris)", cursor: "pointer" }}
    />
  );
}

function displayFrom(m: { baseUnits: bigint; asset: "USD" | "USDC" }): string {
  const decimals = m.asset === "USD" ? 2 : 6;
  const divisor = 10n ** BigInt(decimals);
  const neg = m.baseUnits < 0n;
  const abs = neg ? -m.baseUnits : m.baseUnits;
  const whole = (abs / divisor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const frac = (abs % divisor).toString().padStart(decimals, "0").slice(0, 2);
  return `${neg ? "−" : ""}${whole}.${frac}`;
}

function chip(active: boolean): React.CSSProperties {
  return {
    border: `1px solid ${active ? "var(--iris)" : "var(--line-2)"}`,
    background: active ? "rgba(110,121,214,0.14)" : "transparent",
    color: active ? "var(--text)" : "var(--text-2)",
    borderRadius: 7,
    padding: "0.4rem 0.7rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    transition: "all 0.18s var(--ease)",
  };
}

function btn(primary: boolean): React.CSSProperties {
  return {
    border: `1px solid ${primary ? "var(--iris)" : "var(--line-2)"}`,
    background: primary ? "var(--iris)" : "transparent",
    color: primary ? "#fff" : "var(--text)",
    borderRadius: 8,
    padding: "0.55rem 1rem",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s var(--ease)",
  };
}

const errBox: React.CSSProperties = {
  border: "1px solid #5a2521",
  background: "rgba(239,83,80,0.1)",
  color: "#f2a39e",
  borderRadius: 8,
  padding: "0.7rem 0.9rem",
  fontSize: "0.82rem",
};
