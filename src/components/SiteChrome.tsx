import Link from "next/link";
import { SimBadge } from "./SimBadge";

export function SiteHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--line)",
        background: "rgba(8,9,10,0.72)",
        backdropFilter: "saturate(140%) blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="shell flex items-center justify-between" style={{ height: 56 }}>
        <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <Mark />
          <span className="num" style={{ fontSize: "0.85rem", letterSpacing: "-0.01em" }}>
            stablecoin<span style={{ color: "var(--text-3)" }}>/</span>payouts
          </span>
        </Link>
        <nav className="flex items-center gap-6" style={{ fontSize: "0.85rem" }}>
          <Link href="/payouts" style={navLink}>Console</Link>
          <Link href="/brief" style={navLink}>Brief</Link>
          <a href="https://github.com/ms1ny-hue/stripe-stablecoin" style={navLink}>Source</a>
          <SimBadge />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: "5rem" }} className="mt-auto">
      <div
        className="shell"
        style={{ paddingBlock: "2.25rem", color: "var(--text-3)", fontSize: "0.78rem", lineHeight: 1.7 }}
      >
        <p style={{ maxWidth: "52rem" }}>
          Independent product concept by Michael Stanat. Not affiliated with,
          endorsed by, or representing any employer or payments provider. Market
          data is live from public feeds (CoinGecko, ECB-derived FX, Blockscout).
          Stripe objects are created against a{" "}
          <span style={{ color: "var(--text-2)" }}>test-mode key</span>, so no live
          money moves. Pricing and spreads are illustrative. Not financial advice
          and not a regulated service. Stripe, USDC, and other marks belong to
          their respective owners.
        </p>
      </div>
    </footer>
  );
}

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: "var(--text-2)",
};

function Mark() {
  return (
    <span
      aria-hidden
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        border: "1px solid var(--line-2)",
        background: "linear-gradient(150deg, #15171c, #0c0d10)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid var(--iris-bright)" }} />
    </span>
  );
}
