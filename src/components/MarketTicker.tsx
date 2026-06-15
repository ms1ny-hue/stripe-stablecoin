"use client";

import { useEffect, useState } from "react";

interface Feed {
  market: {
    crypto: { usdcUsd: number; usdc24h: number; ethUsd: number; eth24h: number; pegDeviationBps: number; source: string; live: boolean };
    gas: { gasGwei: number; transferUsd: number; source: string; live: boolean };
    fx: { rates: Record<string, number>; asOf: string; source: string; live: boolean };
    fetchedAt: string;
  };
  stripe: { live: boolean; availableUsd: number; recent: Array<{ id: string }> };
}

const FX_SHOW = ["MXN", "NGN", "PHP", "BRL"];

export function MarketTicker() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [err, setErr] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    let alive = true;
    async function pull() {
      try {
        const res = await fetch("/api/feeds", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as Feed;
        if (!alive) return;
        setFeed(data);
        setErr(false);
        setUpdatedAt(new Date().toLocaleTimeString([], { hour12: false }));
      } catch {
        if (alive) setErr(true);
      }
    }
    pull();
    const id = setInterval(pull, 20_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const c = feed?.market.crypto;
  const g = feed?.market.gas;
  const fx = feed?.market.fx.rates;

  return (
    <div
      className="panel"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
      <Head updatedAt={updatedAt} live={!err && !!feed} />
      <Cell label="USDC / USD" loading={!c}>
        <Val
          v={c ? c.usdcUsd.toFixed(4) : "—"}
          tone={c ? (Math.abs(c.pegDeviationBps) <= 10 ? "pos" : "warn") : "dim"}
          sub={c ? `${c.pegDeviationBps >= 0 ? "+" : ""}${c.pegDeviationBps}bp` : ""}
        />
      </Cell>
      <Cell label="ETH / USD" loading={!c}>
        <Val
          v={c ? `$${c.ethUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
          tone={c ? (c.eth24h >= 0 ? "pos" : "neg") : "dim"}
          sub={c ? `${c.eth24h >= 0 ? "+" : ""}${c.eth24h.toFixed(2)}%` : ""}
        />
      </Cell>
      <Cell label="Base gas" loading={!g}>
        <Val v={g ? `${g.gasGwei} gwei` : "—"} tone="dim" sub={g ? `$${g.transferUsd.toFixed(4)}/xfer` : ""} />
      </Cell>
      {FX_SHOW.map((code) => (
        <Cell key={code} label={`USD / ${code}`} loading={!fx}>
          <Val v={fx ? fx[code]?.toFixed(2) ?? "—" : "—"} tone="dim" sub="mid" />
        </Cell>
      ))}
      <Cell label="Stripe float" loading={!feed}>
        <Val
          v={feed ? `$${feed.stripe.availableUsd.toLocaleString()}` : "—"}
          tone="dim"
          sub={feed ? "test mode" : ""}
        />
      </Cell>
    </div>
  );
}

function Head({ updatedAt, live }: { updatedAt: string; live: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0.7rem 1rem",
        borderRight: "1px solid var(--line)",
        minWidth: 150,
      }}
    >
      <span className={live ? "live-dot" : ""} style={!live ? offDot : undefined} />
      <div style={{ display: "grid" }}>
        <span className="label" style={{ color: live ? "var(--pos)" : "var(--neg)" }}>
          {live ? "Live" : "Offline"}
        </span>
        <span className="num" style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
          {updatedAt || "connecting"}
        </span>
      </div>
    </div>
  );
}

function Cell({
  label,
  loading,
  children,
}: {
  label: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "0.7rem 1rem",
        borderRight: "1px solid var(--line)",
        minWidth: 116,
        opacity: loading ? 0.5 : 1,
        transition: "opacity 0.3s",
      }}
    >
      <div className="label">{label}</div>
      {children}
    </div>
  );
}

function Val({
  v,
  sub,
  tone,
}: {
  v: string;
  sub: string;
  tone: "pos" | "neg" | "warn" | "dim";
}) {
  const color =
    tone === "pos"
      ? "var(--pos)"
      : tone === "neg"
        ? "var(--neg)"
        : tone === "warn"
          ? "var(--warn)"
          : "var(--text)";
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 3 }}>
      <span className="num" style={{ fontSize: "0.92rem", color }}>
        {v}
      </span>
      {sub && (
        <span className="num" style={{ fontSize: "0.66rem", color: "var(--text-3)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

const offDot: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "var(--neg)",
};
