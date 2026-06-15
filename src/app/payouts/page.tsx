import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { PayoutConsole } from "@/components/PayoutConsole";

export const metadata: Metadata = {
  title: "Payout console — Stablecoin Payouts",
  description:
    "An interactive, simulated stablecoin payout: itemized fees, all-in cost, settlement time, and a comparison against legacy rails.",
};

export default function PayoutsPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell" style={{ paddingBlock: "clamp(2.5rem,6vw,4.5rem)" }}>
        <div style={{ maxWidth: "44rem", marginBottom: "2rem" }}>
          <div className="eyebrow rise">Payout console</div>
          <h1
            className="rise"
            style={{
              fontSize: "clamp(2rem,5vw,3.2rem)",
              letterSpacing: "-0.03em",
              fontWeight: 600,
              marginTop: "0.7rem",
              animationDelay: "60ms",
            }}
          >
            Price a payout end to end.
          </h1>
          <p
            className="rise serif"
            style={{
              fontSize: "1.15rem",
              color: "var(--ink-soft)",
              marginTop: "1rem",
              lineHeight: 1.6,
              animationDelay: "120ms",
            }}
          >
            Every figure below is computed by the same money engine that ships in
            this repo: integer base units, no floating-point drift. Settlement is
            simulated, never live, and labeled as such.
          </p>
        </div>
        <div className="rise" style={{ animationDelay: "180ms" }}>
          <PayoutConsole />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
