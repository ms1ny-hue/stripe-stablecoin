# Stablecoin Payouts

A working product concept for paying platform sellers globally in USDC: settled
in seconds on a prefunded float, priced as a basis-point take rate instead of a
flat wire fee.

**Live:** https://stripe-stablecoin.vercel.app
**Brief:** https://stripe-stablecoin.vercel.app/brief

This is an independent concept by Michael Stanat. It is not affiliated with any
employer or payments provider. No live money moves: Stripe runs in test mode.

## What is real

- **Live market data.** The USDC peg (CoinGecko), FX mid-market rates
  (ECB-derived), and Base on-chain gas (Blockscout) are pulled live and feed the
  settlement math directly. No hardcoded assumptions.
- **Real Stripe.** Each settlement creates a genuine USDC PaymentIntent against a
  Stripe test-mode key and returns an object id that resolves in the dashboard.
- **Real money math.** All money is integer base units, never floating-point.
  The quote, fee waterfall, and baseline comparison are pure, tested functions.

## Architecture

| Path | Purpose |
| --- | --- |
| `src/lib/stablecoin.ts` | Integer base-unit money primitives (USDC 6dp, USD cents) |
| `src/lib/payout.ts` | Quote engine: fee waterfall, live peg/gas/FX, baseline comparison |
| `src/lib/feeds.ts` | Live market feeds with per-source timeouts and typed fallbacks |
| `src/lib/stripe.ts` | Server-only Stripe client with a live-key guard |
| `src/app/api/feeds` | Aggregated live market snapshot (30s revalidate) |
| `src/app/api/payout` | Validates input, prices against live data, creates the PaymentIntent |
| `src/components/PayoutConsole.tsx` | The interactive settlement console |
| `src/components/MarketTicker.tsx` | Polling live market strip |

## Run it

```bash
pnpm install
cp .env.example .env.local   # add a Stripe TEST-mode secret key
pnpm dev
```

```bash
pnpm test        # vitest, 80% coverage thresholds
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm build       # production build
```

## Automation

The repo runs itself through the Claude CLI rather than a metered API. Edit-time
hooks format, lint, and type-check on every change; a nightly agent runs the
tests, opens fix and dependency pull requests, and writes a digest. See
[AUTOMATION.md](AUTOMATION.md).

## Stack

Next.js (App Router), TypeScript, Stripe, Zod, Vitest, deployed on Vercel.
