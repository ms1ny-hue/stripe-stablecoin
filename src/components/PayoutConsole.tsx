"use client";

import { useMemo, useState } from "react";
import {
  type BaselineKey,
  type Receipt,
  compareToBaseline,
  quotePayout,
  settle,
} from "@/lib/payout";

interface Destination {
  readonly code: string;
  readonly label: string;
  readonly currency: string;
  readonly fxSpreadBps: number;
}

const DESTINATIONS: readonly Destination[] = [
  { code: "US", label: "United States", currency: "USDC", fxSpreadBps: 0 },
  { code: "MX", label: "Mexico", currency: "MXN", fxSpreadBps: 75 },
  { code: "NG", label: "Nigeria", currency: "NGN", fxSpreadBps: 120 },
  { code: "PH", label: "Philippines", currency: "PHP", fxSpreadBps: 90 },
  { code: "BR", label: "Brazil", currency: "BRL", fxSpreadBps: 85 },
];

const BASELINE_FOR = (d: Destination): BaselineKey =>
  d.code === "US" ? "ach" : "intlWire";

/** Trim a 6dp USDC string to 2dp with thousands separators for headlines. */
function display(value: string): string {
  const [whole, frac = "00"] = value.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withCommas}.${frac.slice(0, 2)}`;
}

export function PayoutConsole() {
  const [amount, setAmount] = useState(1000);
  const [platformFeeBps, setPlatformFeeBps] = useState(50);
  const [dest, setDest] = useState<Destination>(DESTINATIONS[0]);
  const [instant, setInstant] = useState(true);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [settling, setSettling] = useState(false);

  const quote = useMemo(
    () =>
      quotePayout({
        amountUsd: amount.toFixed(2),
        platformFeeBps,
        fxSpreadBps: dest.fxSpreadBps,
        instant,
      }),
    [amount, platformFeeBps, dest, instant],
  );

  const comparison = useMemo(
    () => compareToBaseline(quote, BASELINE_FOR(dest)),
    [quote, dest],
  );

  function reset() {
    setReceipt(null);
    setSettling(false);
  }

  function onSettle() {
    setSettling(true);
    const seed = Math.round(amount * 100) + platformFeeBps + dest.fxSpreadBps;
    window.setTimeout(() => {
      setReceipt(settle(quote, seed));
      setSettling(false);
    }, 1100);
  }

  return (
    <div
      className="surface"
      style={{ padding: "clamp(1.25rem,3vw,2rem)", overflow: "hidden" }}
    >
      <div
        style={{ display: "grid", gap: "clamp(1.5rem,4vw,3rem)" }}
        className="console-grid"
      >
        {/* ---- controls ---- */}
        <section style={{ display: "grid", gap: "1.6rem" }}>
          <Field label="Payout amount" hint="What the platform sends">
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="num" style={{ fontSize: "2rem", color: "var(--navy)" }}>
                ${display(amount.toFixed(2))}
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={25000}
              step={50}
              value={amount}
              onChange={(e) => {
                reset();
                setAmount(Number(e.target.value));
              }}
              style={rangeStyle}
              aria-label="Payout amount"
            />
          </Field>

          <Field label="Destination" hint="Where the seller gets paid">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DESTINATIONS.map((d) => {
                const active = d.code === dest.code;
                return (
                  <button
                    key={d.code}
                    onClick={() => {
                      reset();
                      setDest(d);
                    }}
                    style={chip(active)}
                  >
                    {d.label}
                    <span style={{ opacity: 0.6, marginLeft: 6 }}>{d.currency}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            label={`Platform fee: ${(platformFeeBps / 100).toFixed(2)}%`}
            hint="Your take rate, the revenue line"
          >
            <input
              type="range"
              min={0}
              max={300}
              step={5}
              value={platformFeeBps}
              onChange={(e) => {
                reset();
                setPlatformFeeBps(Number(e.target.value));
              }}
              style={rangeStyle}
              aria-label="Platform fee basis points"
            />
          </Field>

          <Field label="Rail" hint="Instant draws prefunded USDC float">
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { reset(); setInstant(true); }} style={chip(instant)}>
                Instant
              </button>
              <button onClick={() => { reset(); setInstant(false); }} style={chip(!instant)}>
                Batched
              </button>
            </div>
          </Field>
        </section>

        {/* ---- quote + settle ---- */}
        <section style={{ display: "grid", gap: "1.25rem", alignContent: "start" }}>
          <div
            style={{
              background: "linear-gradient(160deg,var(--navy),var(--navy-deep))",
              borderRadius: 12,
              padding: "1.3rem 1.4rem",
              color: "#fff",
            }}
          >
            <div className="eyebrow" style={{ color: "var(--gold-bright)" }}>
              Seller receives
            </div>
            <div
              className="num"
              style={{ fontSize: "2.3rem", marginTop: 4, fontWeight: 500 }}
            >
              {displayFrom(quote.net)}
              <span style={{ fontSize: "1rem", opacity: 0.7, marginLeft: 8 }}>
                USDC
              </span>
            </div>
          </div>

          <Itemize quote={quote} dest={dest} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--line)",
              paddingTop: "1rem",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
              vs {comparison.label}:{" "}
              <strong style={{ color: "var(--good)" }}>
                {comparison.fasterBy} faster
              </strong>
            </div>
            <SettleButton
              settling={settling}
              done={!!receipt}
              onSettle={onSettle}
              onReset={reset}
            />
          </div>

          {receipt && <ReceiptCard receipt={receipt} currency={dest.currency} />}
        </section>
      </div>

      <style>{`
        .console-grid { grid-template-columns: 1fr; }
        @media (min-width: 860px) {
          .console-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}

/* helpers / subcomponents ------------------------------------------------- */

function Itemize({
  quote,
  dest,
}: {
  quote: ReturnType<typeof quotePayout>;
  dest: Destination;
}) {
  const rows: Array<[string, string]> = [
    ["USD in", `$${displayFrom(quote.gross)}`],
    ["Settled to USDC", displayFrom(quote.settledUsdc) + " USDC"],
    ["Platform fee", "−" + displayFrom(quote.platformFee)],
  ];
  if (dest.fxSpreadBps > 0) {
    rows.push([`FX spread → ${dest.currency}`, "−" + displayFrom(quote.fxSpread)]);
  }
  rows.push(["Network fee", "−" + displayFrom(quote.networkFee)]);
  return (
    <dl style={{ display: "grid", gap: 0, margin: 0 }}>
      {rows.map(([k, v]) => (
        <div
          key={k}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.5rem 0",
            borderBottom: "1px solid var(--line)",
            fontSize: "0.92rem",
          }}
        >
          <dt style={{ color: "var(--ink-soft)" }}>{k}</dt>
          <dd className="num" style={{ margin: 0 }}>
            {v}
          </dd>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "0.7rem",
          fontWeight: 600,
        }}
      >
        <dt>All-in cost</dt>
        <dd className="num" style={{ margin: 0, color: "var(--gold)" }}>
          {(quote.effectiveCostBps / 100).toFixed(2)}%
        </dd>
      </div>
    </dl>
  );
}

function displayFrom(m: { baseUnits: bigint; asset: "USD" | "USDC" }): string {
  const decimals = m.asset === "USD" ? 2 : 6;
  const divisor = 10n ** BigInt(decimals);
  const whole = (m.baseUnits / divisor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const frac = (m.baseUnits % divisor).toString().padStart(decimals, "0").slice(0, 2);
  return `${whole}.${frac}`;
}

function SettleButton({
  settling,
  done,
  onSettle,
  onReset,
}: {
  settling: boolean;
  done: boolean;
  onSettle: () => void;
  onReset: () => void;
}) {
  if (done) {
    return (
      <button onClick={onReset} style={btn(false)}>
        New payout
      </button>
    );
  }
  return (
    <button onClick={onSettle} disabled={settling} style={btn(true)}>
      {settling ? "Settling…" : "Settle payout"}
    </button>
  );
}

function ReceiptCard({
  receipt,
  currency,
}: {
  receipt: Receipt;
  currency: string;
}) {
  return (
    <div
      className="rise"
      style={{
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "1rem 1.1rem",
        background: "#fff",
      }}
    >
      <div className="eyebrow">Settled · simulated</div>
      <div style={{ display: "grid", gap: 6, marginTop: 8, fontSize: "0.85rem" }}>
        <Row k="Payout ID" v={receipt.id} />
        <Row k="Tx hash" v={receipt.txHash} />
        <Row k="Delivered" v={`${display(receipt.net)} USDC → ${currency}`} />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "var(--ink-faint)" }}>{k}</span>
      <span className="num" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {v}
      </span>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>{label}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>{hint}</div>
      </div>
      {children}
    </div>
  );
}

const rangeStyle: React.CSSProperties = {
  width: "100%",
  accentColor: "var(--navy)",
  cursor: "pointer",
};

function chip(active: boolean): React.CSSProperties {
  return {
    border: `1px solid ${active ? "var(--navy)" : "var(--line)"}`,
    background: active ? "var(--navy)" : "#fff",
    color: active ? "#fff" : "var(--ink-soft)",
    borderRadius: 999,
    padding: "0.4rem 0.8rem",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "all 0.2s var(--ease)",
  };
}

function btn(primary: boolean): React.CSSProperties {
  return {
    border: `1px solid ${primary ? "var(--navy)" : "var(--line)"}`,
    background: primary ? "var(--navy)" : "#fff",
    color: primary ? "#fff" : "var(--ink)",
    borderRadius: 10,
    padding: "0.6rem 1.1rem",
    fontSize: "0.92rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "transform 0.15s var(--ease), opacity 0.15s",
  };
}
