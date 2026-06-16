import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Brief — Stablecoin Payouts",
  description:
    "The product judgment behind the console: the problem, the wedge, the commercial model, what is live, and what comes next.",
};

export default function BriefPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell" style={{ paddingBlock: "clamp(2rem,5vw,3.5rem)" }}>
        <article style={{ maxWidth: "42rem", marginInline: "auto" }}>
          <div className="label rise" style={{ color: "var(--iris-bright)" }}>Product brief</div>
          <h1
            className="rise"
            style={{
              fontSize: "clamp(1.9rem,5vw,3rem)",
              letterSpacing: "-0.035em",
              fontWeight: 600,
              marginTop: "0.7rem",
              lineHeight: 1.06,
              animationDelay: "60ms",
            }}
          >
            <span className="gradient-text">Stablecoin Payouts</span>: a working
            product concept
          </h1>
          <p className="rise lead" style={{ animationDelay: "120ms" }}>
            A platform payout product that settles in seconds on a prefunded USDC
            balance and is priced as a basis-point take rate instead of a flat
            wire fee. It runs on a real money engine, live market data, and a real
            Stripe integration in test mode. It is not affiliated with any employer
            or payments provider, and no live money moves. The point is product
            judgment and the ability to ship.
          </p>

          <H2>Why this problem</H2>
          <P>
            Platforms have largely solved pay-in. A buyer checks out in one tap.
            Pay-out is still the hard, expensive half, especially across borders.
            An international wire takes one to three days, carries a flat fee in the
            range of twenty-five to forty-five dollars, and loses another two to
            four percent in an FX spread the recipient never sees itemized. For a
            marketplace paying thousands of sellers in dozens of countries, that is
            both a margin problem and a retention problem. Sellers leave platforms
            that pay slowly.
          </P>
          <P>
            Stablecoins change the unit economics of that last step. A platform
            holds a USDC float as working capital, pays a seller out of it, and has
            the funds clear in seconds. The cost stops looking like a bank fee and
            starts looking like software: a few basis points the platform sets.
          </P>

          <H2>What is live</H2>
          <P>
            The console is not a mockup. The USDC peg comes from CoinGecko, FX
            mid-market rates come from an ECB-derived feed, and on-chain gas comes
            from Blockscout on Base. Those feed the settlement math directly, so the
            net to the seller and the all-in cost reflect the actual market, not a
            hardcoded assumption. Pressing Create in Stripe calls the Stripe API in
            test mode and creates a real USDC PaymentIntent, returning a genuine
            object id that resolves in the dashboard. There are no fake numbers and
            no fake transaction hashes anywhere in the app.
          </P>

          <H2>The commercial model</H2>
          <ul style={listStyle}>
            <Li><B>Platform fee.</B> A basis-point take rate on each payout, the primary revenue line, scaling with volume rather than transaction count.</Li>
            <Li><B>FX spread.</B> For local-currency delivery, a transparent spread on the conversion, shown as its own line item rather than buried.</Li>
            <Li><B>Float economics.</B> The prefunded USDC balance is working capital. At scale, the yield and treasury management on that float is a second revenue line, and the main thing a treasurer will scrutinize, so it should never be overstated.</Li>
          </ul>

          <H2>What I built</H2>
          <P>
            Money is handled as integer base units, never floating-point, with USDC
            at six decimals and fiat at cents. The quote, the fee waterfall, and the
            baseline comparison are pure functions that never mutate inputs, covered
            by unit tests with enforced coverage thresholds. The live feeds each
            have a timeout and a typed fallback, so one dead upstream never breaks
            the payout path. The repository also runs itself: edit-time hooks format,
            lint, and type-check on every change, and a nightly agent runs the tests,
            opens fix and dependency pull requests, and writes a digest, all through
            the Claude CLI rather than a metered API.
          </P>

          <H2>What I would build next</H2>
          <ol style={listStyle}>
            <Li>Move from a USDC PaymentIntent to a stablecoin financial account with an outbound transfer once that access is enabled, keeping the same quote contract.</Li>
            <Li>Add the reconciliation view that ties each transfer back to the platform ledger, since reconciliation, not the transfer, is the real work.</Li>
            <Li>Model the float as a real balance with funding, drawdown, and a low-balance alert, because running out of float is the failure mode that matters.</Li>
            <Li>Add per-country compliance and payout eligibility, where a product like this lives or dies in practice.</Li>
          </ol>

          <H2>About</H2>
          <P>
            Built by Michael Stanat. Fifteen years in payments and financial
            services, with work supporting JPMorgan, Visa, Mastercard, Capital One,
            and American Express, and an MS in FinTech from NYU Stern.
          </P>

          <div style={{ display: "flex", gap: 12, marginTop: "2.5rem", flexWrap: "wrap" }}>
            <Link href="/payouts" style={cta(true)}>Open the console →</Link>
            <Link href="/" style={cta(false)}>Back to overview</Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: "clamp(1.25rem,2.6vw,1.6rem)", letterSpacing: "-0.02em", fontWeight: 600, marginTop: "2.4rem", marginBottom: "0.5rem" }}>
      {children}
    </h2>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "1rem", lineHeight: 1.72, color: "var(--text-2)", marginTop: "0.8rem" }}>{children}</p>;
}
function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ fontSize: "1rem", lineHeight: 1.68, color: "var(--text-2)", marginTop: "0.5rem" }}>{children}</li>;
}
function B({ children }: { children: React.ReactNode }) {
  return <b style={{ color: "var(--text)", fontWeight: 600 }}>{children}</b>;
}
const listStyle: React.CSSProperties = { marginTop: "0.8rem", paddingLeft: "1.1rem", display: "grid", gap: "0.1rem" };
function cta(primary: boolean): React.CSSProperties {
  return {
    display: "inline-block",
    textDecoration: "none",
    borderRadius: 9,
    padding: "0.7rem 1.15rem",
    fontWeight: 500,
    fontSize: "0.9rem",
    border: `1px solid ${primary ? "transparent" : "var(--line-2)"}`,
    background: primary ? "linear-gradient(180deg, var(--iris-bright), var(--iris))" : "rgba(255,255,255,0.02)",
    color: primary ? "#0a0b12" : "var(--text)",
    boxShadow: primary ? "0 8px 24px -10px rgba(110,121,214,0.7)" : "none",
  };
}
