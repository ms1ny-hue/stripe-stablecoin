"use client";

import { useEffect, useRef, useState } from "react";
import { Tween } from "./motion";

interface Rail {
  readonly name: string;
  readonly cost: number;
  readonly time: string;
  readonly accent?: boolean;
  readonly live?: boolean;
}

const PAYOUT = 10_000;

export function CostChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [gasUsd, setGasUsd] = useState(0.0011);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/feeds", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.market?.gas?.networkFeeUsd != null) {
          setGasUsd(d.market.gas.networkFeeUsd);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Modeled legacy costs; stablecoin uses a 0.6% all-in spread + live on-chain gas.
  const stableCost = PAYOUT * 0.006 + gasUsd;
  const rails: Rail[] = [
    { name: "International wire", cost: 345, time: "1–3 days" },
    { name: "Card / PSP payout", cost: 215, time: "1–2 days" },
    { name: "Stablecoin payout", cost: stableCost, time: "~5 seconds", accent: true, live: true },
  ];
  const max = Math.max(...rails.map((r) => r.cost));
  const cheaper = (345 / stableCost).toFixed(1);

  return (
    <div ref={ref} className="card" style={{ padding: "1.4rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div className="label">All-in cost · $10,000 cross-border payout</div>
        <div className="label" style={{ color: "var(--pos)" }}>● live gas</div>
      </div>

      <div style={{ display: "grid", gap: "0.95rem", marginTop: "1.3rem" }}>
        {rails.map((r, i) => {
          const pct = armed ? (r.cost / max) * 100 : 0;
          return (
            <div key={r.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: "0.88rem", color: r.accent ? "var(--text)" : "var(--text-2)", fontWeight: r.accent ? 600 : 400 }}>
                  {r.name}
                  <span className="label" style={{ marginLeft: 8, color: "var(--text-3)" }}>{r.time}</span>
                </span>
                <span className="num" style={{ fontSize: "0.95rem", color: r.accent ? "var(--iris-bright)" : "var(--text-2)" }}>
                  $<Tween value={armed ? r.cost : 0} format={(n) => n.toFixed(2)} />
                </span>
              </div>
              <div style={{ height: 10, borderRadius: 99, background: "var(--bg-2)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 99,
                    background: r.accent
                      ? "linear-gradient(90deg, var(--iris), var(--teal))"
                      : "var(--line-2)",
                    transition: `width 1.1s var(--ease) ${i * 120}ms`,
                    boxShadow: r.accent ? "0 0 20px -2px rgba(110,121,214,0.6)" : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "1.3rem", paddingTop: "1.1rem", borderTop: "1px solid var(--line)", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <Figure value={`${cheaper}×`} label="cheaper than a wire" accent />
        <Figure value="seconds" label="not days to settle" />
        <Figure value="100%" label="itemized, no hidden FX" />
      </div>
    </div>
  );
}

function Figure({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <div className="num" style={{ fontSize: "1.4rem", color: accent ? "var(--iris-bright)" : "var(--text)" }}>{value}</div>
      <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: 2 }}>{label}</div>
    </div>
  );
}
