import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <Wedge />
        <HowItWorks />
        <Close />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="shell" style={{ paddingBlock: "clamp(3.5rem,9vw,7rem)" }}>
      <div style={{ maxWidth: "52rem" }}>
        <div className="eyebrow rise">Product concept · working demo</div>
        <h1
          className="rise"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4.4rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            fontWeight: 600,
            marginTop: "1rem",
            animationDelay: "60ms",
          }}
        >
          Pay anyone, anywhere,
          <br />
          in <span style={{ color: "var(--navy)" }}>seconds</span>.{" "}
          <span className="serif" style={{ fontStyle: "italic", fontWeight: 400 }}>
            Priced like software.
          </span>
        </h1>
        <p
          className="rise serif"
          style={{
            fontSize: "clamp(1.05rem,2.2vw,1.35rem)",
            color: "var(--ink-soft)",
            marginTop: "1.4rem",
            lineHeight: 1.6,
            maxWidth: "40rem",
            animationDelay: "120ms",
          }}
        >
          Cross-border payouts still run on a forty-year-old wire network: days to
          settle, fees measured in dollars, opaque FX. Stablecoins collapse that
          to a prefunded balance that moves in seconds. This is a working model of
          what a platform payout product looks like when it is built that way.
        </p>
        <div
          className="rise"
          style={{
            display: "flex",
            gap: 14,
            marginTop: "2rem",
            flexWrap: "wrap",
            animationDelay: "180ms",
          }}
        >
          <Link href="/payouts" style={cta(true)}>
            Try the payout demo →
          </Link>
          <Link href="/brief" style={cta(false)}>
            Read the product brief
          </Link>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <Band tone="paper">
      <SectionHead
        eyebrow="The status quo"
        title="Payouts are the slowest, most expensive part of a platform."
      />
      <div className="stat-row">
        <Stat n="1–3 days" l="to settle an international wire" />
        <Stat n="$25–45" l="in flat fees per cross-border payout" />
        <Stat n="2–4%" l="lost to opaque FX spreads" />
      </div>
    </Band>
  );
}

function Wedge() {
  return (
    <Band tone="navy">
      <SectionHead
        eyebrow="The wedge"
        title="A prefunded USDC balance settles in seconds, at a cost you set."
        light
      />
      <p
        className="serif"
        style={{
          color: "rgba(255,255,255,0.82)",
          fontSize: "1.15rem",
          lineHeight: 1.7,
          maxWidth: "44rem",
        }}
      >
        Hold a stablecoin float, pay sellers out of it instantly, and recognize
        revenue as a basis-point take rate instead of a fixed wire fee. The same
        rail reaches a freelancer in Lagos and a marketplace seller in São Paulo.
        The demo prices every payout end to end: platform fee, FX spread, network
        cost, all-in basis points, and how much faster it clears than the legacy
        rail it replaces.
      </p>
    </Band>
  );
}

function HowItWorks() {
  const steps: Array<[string, string, string]> = [
    [
      "01",
      "Fund the float",
      "The platform holds a USDC balance as working capital for payouts.",
    ],
    [
      "02",
      "Quote the payout",
      "Amount in, fees itemized, net out, settlement time, all computed up front.",
    ],
    [
      "03",
      "Settle and reconcile",
      "Funds move on-chain in seconds; the receipt ties to the platform ledger.",
    ],
  ];
  return (
    <Band tone="paper">
      <SectionHead eyebrow="How it works" title="Three steps, fully modeled." />
      <div className="step-grid">
        {steps.map(([n, t, d]) => (
          <div key={n} className="surface" style={{ padding: "1.4rem 1.5rem" }}>
            <div className="num" style={{ color: "var(--gold)", fontSize: "1.6rem" }}>
              {n}
            </div>
            <h3
              style={{
                fontSize: "1.15rem",
                margin: "0.6rem 0 0.4rem",
                fontWeight: 600,
              }}
            >
              {t}
            </h3>
            <p
              style={{
                color: "var(--ink-soft)",
                lineHeight: 1.6,
                fontSize: "0.95rem",
              }}
            >
              {d}
            </p>
          </div>
        ))}
      </div>
    </Band>
  );
}

function Close() {
  return (
    <Band tone="paper">
      <div
        style={{ textAlign: "center", maxWidth: "40rem", marginInline: "auto" }}
      >
        <h2
          style={{
            fontSize: "clamp(1.8rem,4vw,2.6rem)",
            letterSpacing: "-0.02em",
            fontWeight: 600,
          }}
        >
          See the economics, live.
        </h2>
        <p
          className="serif"
          style={{
            color: "var(--ink-soft)",
            marginTop: "0.8rem",
            fontSize: "1.1rem",
          }}
        >
          Move the sliders. Watch the all-in cost and settlement time respond.
        </p>
        <div style={{ marginTop: "1.6rem" }}>
          <Link href="/payouts" style={cta(true)}>
            Open the payout console →
          </Link>
        </div>
      </div>
    </Band>
  );
}

/* primitives -------------------------------------------------------------- */

function Band({
  tone,
  children,
}: {
  tone: "paper" | "navy";
  children: React.ReactNode;
}) {
  const navy = tone === "navy";
  return (
    <section
      style={{
        background: navy
          ? "linear-gradient(160deg,var(--navy),var(--navy-deep))"
          : "transparent",
        borderTop: "1px solid var(--line)",
        color: navy ? "#fff" : "inherit",
      }}
    >
      <div className="shell" style={{ paddingBlock: "clamp(3rem,7vw,5rem)" }}>
        {children}
      </div>
      <style>{`
        .stat-row { display:grid; gap:1.5rem; grid-template-columns:1fr; margin-top:2rem; }
        .step-grid { display:grid; gap:1.25rem; grid-template-columns:1fr; margin-top:2rem; }
        @media (min-width:760px){
          .stat-row { grid-template-columns:repeat(3,1fr); }
          .step-grid { grid-template-columns:repeat(3,1fr); }
        }
      `}</style>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  light,
}: {
  eyebrow: string;
  title: string;
  light?: boolean;
}) {
  return (
    <div style={{ maxWidth: "40rem" }}>
      <div className="eyebrow">{eyebrow}</div>
      <h2
        style={{
          fontSize: "clamp(1.6rem,3.6vw,2.4rem)",
          letterSpacing: "-0.02em",
          fontWeight: 600,
          marginTop: "0.7rem",
          lineHeight: 1.12,
          color: light ? "#fff" : "var(--ink)",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div style={{ borderTop: "2px solid var(--gold)", paddingTop: "0.9rem" }}>
      <div
        className="num"
        style={{ fontSize: "2rem", color: "var(--navy)", fontWeight: 500 }}
      >
        {n}
      </div>
      <div style={{ color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 }}>
        {l}
      </div>
    </div>
  );
}

function cta(primary: boolean): React.CSSProperties {
  return {
    display: "inline-block",
    textDecoration: "none",
    borderRadius: 10,
    padding: "0.8rem 1.3rem",
    fontWeight: 500,
    fontSize: "1rem",
    border: `1px solid ${primary ? "var(--navy)" : "var(--line)"}`,
    background: primary ? "var(--navy)" : "#fff",
    color: primary ? "#fff" : "var(--ink)",
  };
}
