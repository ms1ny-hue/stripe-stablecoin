import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { MarketTicker } from "@/components/MarketTicker";
import { CostChart } from "@/components/CostChart";
import { Reveal } from "@/components/motion";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <TickerBand />
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
      <div className="hero-grid">
        <div>
          <Reveal>
            <div className="label" style={{ color: "var(--iris-bright)" }}>
              Product concept · live settlement console
            </div>
          </Reveal>
          <Reveal delay={70}>
            <h1 className="display" style={{ marginTop: "1.1rem", maxWidth: "16ch" }}>
              Pay anyone, anywhere, in{" "}
              <span className="gradient-text">seconds</span>.
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead" style={{ maxWidth: "44ch" }}>
              A platform payout product on a prefunded USDC float. Priced against
              live FX, live on-chain gas, and the real USDC peg, settled through
              the Stripe API.
            </p>
          </Reveal>
          <Reveal delay={210}>
            <div style={{ display: "flex", gap: 12, marginTop: "2rem", flexWrap: "wrap" }}>
              <Link href="/payouts" style={cta(true)}>Open the console →</Link>
              <Link href="/brief" style={cta(false)}>Read the brief</Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={180} style={{ minWidth: 0 }}>
          <CostChart />
        </Reveal>
      </div>
      <style>{`
        .hero-grid { display:grid; gap:clamp(1.5rem,4vw,3rem); grid-template-columns:1fr; align-items:center; }
        @media (min-width:920px){ .hero-grid { grid-template-columns:1.05fr 0.95fr; } }
      `}</style>
    </section>
  );
}

function TickerBand() {
  return (
    <section className="shell" style={{ paddingBottom: "clamp(3rem,7vw,5rem)" }}>
      <Reveal>
        <MarketTicker />
      </Reveal>
    </section>
  );
}

function Features() {
  const items: Array<[string, string, string]> = [
    ["Live market data", "The USDC peg, FX mid-market, and Base gas are pulled live and feed the fee math directly. No hardcoded assumptions.", "01"],
    ["Real Stripe", "Each settlement creates a genuine USDC PaymentIntent in test mode, with an object id that resolves in the dashboard.", "02"],
    ["Real money math", "Integer base units, pure functions, a tested fee waterfall. No floating-point on money, anywhere.", "03"],
  ];
  return (
    <Section eyebrow="What it is">
      <div className="feat-grid">
        {items.map(([t, d, n], i) => (
          <Reveal key={n} delay={i * 90}>
            <div className="card card-hover" style={{ padding: "1.5rem 1.6rem", height: "100%" }}>
              <div className="num" style={{ color: "var(--iris-bright)", fontSize: "0.85rem" }}>{n}</div>
              <h3 style={{ fontSize: "1.12rem", fontWeight: 600, margin: "0.7rem 0 0.5rem", letterSpacing: "-0.02em" }}>{t}</h3>
              <p style={{ color: "var(--text-2)", fontSize: "0.92rem", lineHeight: 1.62 }}>{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`
        .feat-grid { display:grid; gap:1.1rem; grid-template-columns:1fr; }
        @media (min-width:760px){ .feat-grid { grid-template-columns:repeat(3,1fr); } }
      `}</style>
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
          <Reveal key={t} delay={i * 80}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3rem 1fr",
                gap: "1rem",
                padding: "1.3rem 0",
                borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none",
                alignItems: "baseline",
              }}
            >
              <span className="num" style={{ color: "var(--iris-bright)", fontSize: "1.1rem" }}>0{i + 1}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>{t}</div>
                <div style={{ color: "var(--text-2)", fontSize: "0.92rem", marginTop: 4, lineHeight: 1.6 }}>{d}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Close() {
  return (
    <Section eyebrow="">
      <Reveal>
        <div
          className="card"
          style={{
            padding: "clamp(2.2rem,5vw,3.8rem)",
            textAlign: "center",
            background: "linear-gradient(180deg, rgba(110,121,214,0.08), rgba(255,255,255,0)), var(--bg-1)",
          }}
        >
          <h2 className="display" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)" }}>
            See the economics move, <span className="gradient-text">live</span>.
          </h2>
          <p style={{ color: "var(--text-2)", marginTop: "0.9rem", fontSize: "1.05rem" }}>
            Adjust the payout. Watch the all-in cost and settlement time respond to real market data.
          </p>
          <div style={{ marginTop: "1.6rem" }}>
            <Link href="/payouts" style={cta(true)}>Open the console →</Link>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function Section({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="shell" style={{ paddingBlock: "clamp(2.5rem,6vw,4.5rem)" }}>
      {eyebrow && (
        <Reveal>
          <div className="label" style={{ marginBottom: "1.6rem" }}>{eyebrow}</div>
        </Reveal>
      )}
      {children}
    </section>
  );
}

function cta(primary: boolean): React.CSSProperties {
  return {
    display: "inline-block",
    textDecoration: "none",
    borderRadius: 9,
    padding: "0.72rem 1.2rem",
    fontWeight: 500,
    fontSize: "0.92rem",
    border: `1px solid ${primary ? "transparent" : "var(--line-2)"}`,
    background: primary ? "linear-gradient(180deg, var(--iris-bright), var(--iris))" : "rgba(255,255,255,0.02)",
    color: primary ? "#0a0b12" : "var(--text)",
    boxShadow: primary ? "0 8px 24px -10px rgba(110,121,214,0.7)" : "none",
  };
}
