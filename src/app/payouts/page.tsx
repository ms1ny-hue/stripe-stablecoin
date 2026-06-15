import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { MarketTicker } from "@/components/MarketTicker";
import { PayoutConsole } from "@/components/PayoutConsole";

export const metadata: Metadata = {
  title: "Console — Stablecoin Payouts",
  description:
    "Price a USDC payout against live FX, on-chain gas, and the real USDC peg, then settle through the Stripe API in test mode.",
};

export default function PayoutsPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell" style={{ paddingBlock: "clamp(2rem,5vw,3.5rem)" }}>
        <div style={{ maxWidth: "44rem", marginBottom: "1.6rem" }}>
          <div className="label rise" style={{ color: "var(--iris-bright)" }}>Settlement console</div>
          <h1
            className="rise"
            style={{
              fontSize: "clamp(1.9rem,5vw,3rem)",
              letterSpacing: "-0.035em",
              fontWeight: 600,
              marginTop: "0.7rem",
              animationDelay: "60ms",
            }}
          >
            Price a payout against live markets.
          </h1>
          <p
            className="rise"
            style={{
              fontSize: "1.05rem",
              color: "var(--text-2)",
              marginTop: "0.9rem",
              lineHeight: 1.6,
              animationDelay: "120ms",
            }}
          >
            The peg, FX, and gas below are pulled live. Create in Stripe makes a
            real USDC PaymentIntent against a test-mode key, so you get a genuine
            object id with no live money.
          </p>
        </div>

        <div className="rise" style={{ marginBottom: "1.4rem", animationDelay: "160ms" }}>
          <MarketTicker />
        </div>

        <div className="rise" style={{ animationDelay: "200ms" }}>
          <PayoutConsole />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
