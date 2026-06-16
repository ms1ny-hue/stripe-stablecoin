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
      <div className="shell flex items-center justify-between" style={{ height: 56, gap: 16 }}>
        <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <Mark />
          <span className="num" style={{ fontSize: "0.85rem", letterSpacing: "-0.01em", color: "var(--text-2)" }}>
            stablecoin<span className="gradient-text" style={{ fontWeight: 600, padding: "0 1px" }}>/</span>
            <span style={{ color: "var(--text)" }}>payouts</span>
          </span>
        </Link>
        <nav className="flex items-center gap-5" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
          <Link href="/payouts" style={navLink}>Console</Link>
          <Link href="/brief" style={navLink} className="nav-extra">Brief</Link>
          <a href="https://github.com/ms1ny-hue/stripe-stablecoin" style={navLink} className="nav-extra">Source</a>
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
  // Settlement node: a gradient diamond frame with a glowing center point.
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <defs>
        <linearGradient id="markg" x1="2" y1="2" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#939df2" />
          <stop offset="1" stopColor="#3fbbb0" />
        </linearGradient>
        <filter id="markglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M11 1.5 L20.5 11 L11 20.5 L1.5 11 Z"
        stroke="url(#markg)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="11" r="2.7" fill="url(#markg)" filter="url(#markglow)" />
    </svg>
  );
}
