import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Product brief — Stablecoin Payouts",
  description:
    "The product judgment behind the demo: the problem, the wedge, the commercial model, what is real, and what comes next.",
};

export default function BriefPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell" style={{ paddingBlock: "clamp(2.5rem,6vw,4.5rem)" }}>
        <article style={{ maxWidth: "44rem", marginInline: "auto" }}>
          <div className="eyebrow rise">Product brief</div>
          <h1
            className="rise"
            style={{
              fontSize: "clamp(2rem,5vw,3.2rem)",
              letterSpacing: "-0.03em",
              fontWeight: 600,
              marginTop: "0.7rem",
              lineHeight: 1.05,
              animationDelay: "60ms",
            }}
          >
            Stablecoin Payouts: a working product concept
          </h1>
          <p className="serif lead rise" style={{ animationDelay: "120ms" }}>
            A platform payout product that settles in seconds on a prefunded USDC
            balance and is priced as a basis-point take rate instead of a flat
            wire fee. This is an independent concept with a working demo, a real
            money engine, and a real Stripe integration running in test mode. It
            is not affiliated with any employer or payments provider, and no live
            money moves. The point is to show product judgment and the ability to
            ship.
          </p>

          <H2>Why this problem</H2>
          <P>
            Platforms and marketplaces have largely solved pay-in. A buyer can
            check out in one tap. Pay-out is still the hard, expensive half,
            especially across borders. An international wire takes one to three
            days, carries a flat fee in the range of twenty-five to forty-five
            dollars, and loses another two to four percent in an FX spread the
            recipient never sees itemized. For a marketplace paying thousands of
            sellers in dozens of countries, that is both a margin problem and a
            retention problem. Sellers leave platforms that pay slowly.
          </P>
          <P>
            Stablecoins change the unit economics of that last step. A platform
            can hold a USDC float as working capital, pay a seller directly out of
            it, and have the funds clear in seconds. The cost stops looking like a
            bank fee and starts looking like software: a few basis points the
            platform sets itself.
          </P>

          <H2>What the product does</H2>
          <P>
            The demo lets you price a single payout end to end and watch the
            economics move: choose the amount and destination, set the platform
            fee as a take rate in basis points, and pick instant settlement, which
            draws the prefunded float, or batched. The payout is itemized down to
            the net the seller receives, shown with an all-in cost in a single
            percentage and a comparison against the legacy rail it replaces.
          </P>
          <P>
            That comparison is the part that matters in a room. It turns an
            abstract claim about stablecoins into a number a finance team can react
            to: this payout costs this much and lands this many days sooner.
          </P>

          <H2>The commercial model</H2>
          <ul style={listStyle}>
            <Li>
              <b>Platform fee.</b> A basis-point take rate on each payout. This is
              the primary revenue line and it scales with volume rather than
              transaction count.
            </Li>
            <Li>
              <b>FX spread.</b> For payouts delivered in local currency, a
              transparent spread on the conversion, shown as its own line item
              rather than buried.
            </Li>
            <Li>
              <b>Float economics.</b> The prefunded USDC balance is working
              capital. At scale, the yield and treasury management on that float
              is a second revenue line, and it is also the main thing a treasurer
              will scrutinize, so it should never be overstated.
            </Li>
          </ul>

          <H2>What I actually built</H2>
          <P>
            The demo is not a slide. It runs on a real, tested money engine. All
            money is handled as integer base units, never floating-point, with
            USDC at six decimals and fiat at cents. The quote, the fee waterfall,
            and the baseline comparison are pure functions that return new values
            and never mutate inputs. Unit tests cover the peg conversion, the fee
            waterfall, and the baseline comparison, with coverage thresholds
            enforced in the test runner. Pressing Create in Stripe calls the real
            Stripe API in test mode and creates a USDC PaymentIntent, returning a
            genuine object id that resolves in the Stripe dashboard. There are no
            fake transaction hashes anywhere in the app.
          </P>
          <P>
            The repository also runs itself. Edit-time hooks format, lint, and
            type-check on every change, and a nightly agent runs the test suite,
            opens fix and dependency pull requests, and writes a digest, all
            through the Claude CLI rather than a metered API.
          </P>

          <H2>Test mode versus live</H2>
          <P>
            Every Stripe call runs against a test-mode key, so the PaymentIntents
            are real Stripe objects that you can open in the dashboard, but no live
            money moves. Pricing, FX spreads, and settlement times are illustrative
            rather than quoted rates. Real: the money math, the fee waterfall, the
            baseline comparison, the test suite, the Stripe integration, and the
            build and automation around the repository.
          </P>

          <H2>What I would build next</H2>
          <ol style={listStyle}>
            <Li>
              Move from a USDC PaymentIntent to a stablecoin financial account with
              an outbound transfer once that access is enabled, keeping the same
              itemized quote contract.
            </Li>
            <Li>
              Add the reconciliation view that ties each transfer back to the
              platform ledger, since reconciliation, not the transfer, is the real
              work.
            </Li>
            <Li>
              Model the float as an actual balance with funding, drawdown, and a
              low-balance alert, because running out of float is the failure mode
              that matters.
            </Li>
            <Li>
              Add per-country compliance and payout eligibility, which is where a
              product like this lives or dies in practice.
            </Li>
          </ol>

          <H2>About</H2>
          <P>
            Built by Michael Stanat. Fifteen years in payments and financial
            services, with work supporting JPMorgan, Visa, Mastercard, Capital
            One, and American Express, and an MS in FinTech from NYU Stern. I build
            payments prototypes that a person who has actually run a treasury or a
            payouts operation would find credible.
          </P>

          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: "2.5rem",
              flexWrap: "wrap",
            }}
          >
            <Link href="/payouts" style={cta(true)}>
              Open the payout console →
            </Link>
            <Link href="/" style={cta(false)}>
              Back to overview
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "clamp(1.4rem,3vw,1.9rem)",
        letterSpacing: "-0.02em",
        fontWeight: 600,
        marginTop: "2.6rem",
        marginBottom: "0.6rem",
        color: "var(--navy)",
      }}
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="serif"
      style={{
        fontSize: "1.12rem",
        lineHeight: 1.75,
        color: "var(--ink-soft)",
        marginTop: "0.9rem",
      }}
    >
      {children}
    </p>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li
      className="serif"
      style={{ fontSize: "1.12rem", lineHeight: 1.7, color: "var(--ink-soft)", marginTop: "0.6rem" }}
    >
      {children}
    </li>
  );
}

const listStyle: React.CSSProperties = {
  marginTop: "0.9rem",
  paddingLeft: "1.2rem",
  display: "grid",
  gap: "0.2rem",
};

function cta(primary: boolean): React.CSSProperties {
  return {
    display: "inline-block",
    textDecoration: "none",
    borderRadius: 10,
    padding: "0.75rem 1.2rem",
    fontWeight: 500,
    fontSize: "0.98rem",
    border: `1px solid ${primary ? "var(--navy)" : "var(--line)"}`,
    background: primary ? "var(--navy)" : "#fff",
    color: primary ? "#fff" : "var(--ink)",
  };
}
