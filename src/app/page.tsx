import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { MarketTicker } from "@/components/MarketTicker";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Close />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="shell" style={{ paddingTop: "clamp(3rem,8vw,6rem)", paddingBottom: "2.5rem" }}>
      <div className="label rise" style={{ color: "var(--iris-bright)" }}>
        Product concept · live console
      </div>
      <h1
        className="rise"
        style={{
          fontSize: "clamp(2.2rem,6vw,4.2rem)",
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          fontWeight: 600,
          marginTop: "1rem",
          maxWidth: "20ch",
          animationDelay: "60ms",
        }}
      >
        Pay anyone, anywhere, in seconds. Priced like software.
      </h1>
      <p
        className="rise"
        style={{
          fontSize: "clamp(1.02rem,2vw,1.22rem)",
          color: "var(--text-2)",
          marginTop: "1.3rem",
          lineHeight: 1.6,
          maxWidth: "46ch",
          animationDelay: "120ms",
        }}
      >
        A platform payout product built on a prefunded USDC float. Priced against
        live FX, live on-chain gas, and the real USDC peg, settled through the
        Stripe API.
      </p>
      <div className="rise" style={{ display: "flex", gap: 12, marginTop: "1.8rem", flexWrap: "wrap", animationDelay: "180ms" }}>
        <Link href="/payouts" style={cta(true)}>Open the console →</Link>
        <Link href="/brief" style={cta(false)}>Read the brief</Link>
      </div>
      <div className="rise" style={{ marginTop: "2.5rem", animationDelay: "240ms" }}>
        <MarketTicker />
      </div>
    </section>
  );
}

function Features() {
  const items: Array<[string, string, string]> = [
    ["Live data", "Real FX, the real USDC peg, and live Base gas feed the fee math. No hardcoded assumptions.", "01"],
    ["Real Stripe", "Each settlement creates a genuine USDC PaymentIntent in test mode, with a dashboard link.", "02"],
    ["Real money math", "Integer base units, pure functions, a tested fee waterfall. No floating-point on money.", "03"],
  ];
  return (
    <Section eyebrow="What it is">
      <div className="feat-grid">
        {items.map(([t, d, n]) => (
          <div key={n} style={{ borderTop: "1px solid var(--line)", paddingTop: "1.1rem" }}>
            <div className="num" style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>{n}</div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0.5rem 0 0.4rem" }}>{t}</h3>
            <p style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.6 }}>{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HowItWorks() {
  const rows: Array<[string, string]> = [
    ["Fund the float", "The platform holds a USDC balance as payout working capital."],
    ["Quote against live markets", "Peg, FX mid-market, and on-chain gas resolve the net and the all-in cost up front."],
    ["Settle through Stripe", "A USDC PaymentIntent is created; the receipt ties back to the ledger."],
  ];
  return (
    <Section eyebrow="How it works">
      <div style={{ display: "grid", gap: 0 }}>
        {rows.map(([t, d], i) => (
          <div
            key={t}
            style={{
              display: "grid",
              gridTemplateColumns: "2.5rem 1fr",
              gap: "1rem",
              padding: "1.1rem 0",
              borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none",
              alignItems: "baseline",
            }}
          >
            <span className="num" style={{ color: "var(--iris-bright)" }}>0{i + 1}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{t}</div>
              <div style={{ color: "var(--text-2)", fontSize: "0.9rem", marginTop: 3, lineHeight: 1.6 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Close() {
  return (
    <Section eyebrow="">
      <div className="panel" style={{ padding: "clamp(2rem,5vw,3.5rem)", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", letterSpacing: "-0.025em", fontWeight: 600 }}>
          See the economics move, live.
        </h2>
        <p style={{ color: "var(--text-2)", marginTop: "0.7rem", fontSize: "1.02rem" }}>
          Adjust the payout. Watch the all-in cost and settlement time respond to real market data.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/payouts" style={cta(true)}>Open the console →</Link>
        </div>
      </div>
    </Section>
  );
}

function Section({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="shell" style={{ paddingBlock: "clamp(2.5rem,6vw,4rem)" }}>
      {eyebrow && <div className="label" style={{ marginBottom: "1.5rem", color: "var(--text-3)" }}>{eyebrow}</div>}
      {children}
      <style>{`
        .feat-grid { display:grid; gap:1.5rem; grid-template-columns:1fr; }
        @media (min-width:760px){ .feat-grid { grid-template-columns:repeat(3,1fr); } }
      `}</style>
    </section>
  );
}

function cta(primary: boolean): React.CSSProperties {
  return {
    display: "inline-block",
    textDecoration: "none",
    borderRadius: 8,
    padding: "0.7rem 1.15rem",
    fontWeight: 500,
    fontSize: "0.92rem",
    border: `1px solid ${primary ? "var(--iris)" : "var(--line-2)"}`,
    background: primary ? "var(--iris)" : "transparent",
    color: primary ? "#fff" : "var(--text)",
  };
}
