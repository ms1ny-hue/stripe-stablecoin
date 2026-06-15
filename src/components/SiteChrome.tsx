import Link from "next/link";
import { SimBadge } from "./SimBadge";

export function SiteHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--line)",
        background: "rgba(250,249,245,0.8)",
        backdropFilter: "saturate(140%) blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div className="shell flex items-center justify-between" style={{ height: 64 }}>
        <Link
          href="/"
          className="flex items-center gap-2.5"
          style={{ textDecoration: "none" }}
        >
          <Mark />
          <span
            style={{
              fontWeight: 600,
              letterSpacing: "-0.01em",
              fontSize: "1.02rem",
            }}
          >
            Stablecoin Payouts
          </span>
        </Link>
        <nav className="flex items-center gap-6" style={{ fontSize: "0.92rem" }}>
          <Link href="/payouts" style={{ textDecoration: "none", color: "var(--ink-soft)" }}>
            Demo
          </Link>
          <a
            href="https://github.com/ms1ny-hue/stripe-stablecoin"
            style={{ textDecoration: "none", color: "var(--ink-soft)" }}
          >
            Source
          </a>
          <SimBadge />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      style={{ borderTop: "1px solid var(--line)", marginTop: "5rem" }}
      className="mt-auto"
    >
      <div
        className="shell"
        style={{ paddingBlock: "2.5rem", color: "var(--ink-faint)", fontSize: "0.82rem" }}
      >
        <p style={{ maxWidth: "48rem", lineHeight: 1.7 }}>
          Independent product concept by Michael Stanat. Not affiliated with,
          endorsed by, or representing any employer or payments provider. Stripe
          objects are created against a{" "}
          <strong style={{ color: "var(--ink-soft)" }}>test-mode key</strong>, so
          no live money moves. Pricing, FX spreads, and settlement times are
          illustrative. Not financial advice and not a regulated service. Stripe,
          USDC, and other marks belong to their respective owners.
        </p>
      </div>
    </footer>
  );
}

function Mark() {
  return (
    <span
      aria-hidden
      style={{
        width: 26,
        height: 26,
        borderRadius: 7,
        background: "linear-gradient(150deg, var(--navy), var(--navy-deep))",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 16px -8px rgba(14,33,72,0.7)",
      }}
    >
      <span
        style={{
          width: 11,
          height: 11,
          borderRadius: "50%",
          border: "2px solid var(--gold-bright)",
        }}
      />
    </span>
  );
}
