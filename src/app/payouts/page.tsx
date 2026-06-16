import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { MarketTicker } from "@/components/MarketTicker";
import { PayoutConsole } from "@/components/PayoutConsole";
import { Reveal } from "@/components/motion";

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
        <div style={{ maxWidth: "46rem", marginBottom: "1.8rem" }}>
          <Reveal>
            <div className="label" style={{ color: "var(--iris-bright)" }}>Settlement console</div>
          </Reveal>
          <Reveal delay={70}>
            <h1 className="display" style={{ fontSize: "clamp(2rem,5vw,3.2rem)", marginTop: "0.8rem" }}>
              Price a payout against{" "}
              <span className="gradient-text">live markets</span>.
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead">
              The peg, FX, and gas below are pulled live. Create in Stripe makes a
              real USDC PaymentIntent against a test-mode key, so you get a genuine
              object id with no live money.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120} style={{ marginBottom: "1.4rem" }}>
          <MarketTicker />
        </Reveal>

        <Reveal delay={180}>
          <PayoutConsole />
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}
