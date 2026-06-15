# Stablecoin Payouts: a working product concept

**One line:** A platform payout product that settles in seconds on a prefunded
USDC balance and is priced as a basis-point take rate instead of a flat wire fee.

This is an independent concept with a working demo, a real money engine, and a
real Stripe integration running in test mode. It is not affiliated with any
employer or payments provider, and no live money moves. The point is to show
product judgment and the ability to ship.

## Why this problem

Platforms and marketplaces have largely solved pay-in. A buyer can check out in
one tap. Pay-out is still the hard, expensive half, especially across borders. An
international wire takes one to three days, carries a flat fee in the range of
twenty-five to forty-five dollars, and loses another two to four percent in an FX
spread the recipient never sees itemized. For a marketplace paying thousands of
sellers in dozens of countries, that is both a margin problem and a retention
problem. Sellers leave platforms that pay slowly.

Stablecoins change the unit economics of that last step. A platform can hold a
USDC float as working capital, pay a seller directly out of it, and have the
funds clear in seconds. The cost stops looking like a bank fee and starts looking
like software: a few basis points the platform sets itself.

## What the product does

The demo lets you price a single payout end to end and watch the economics move:

- Choose the payout amount and the destination country.
- Set the platform fee as a take rate in basis points.
- Choose instant settlement, which draws the prefunded float, or batched.
- See the payout itemized: USD in, settled to USDC at the peg, platform fee, FX
  spread for local delivery, network cost, and the net the seller receives.
- See the all-in cost as a single percentage, and how much faster it clears than
  the legacy rail it replaces.
- Settle the payout and get a receipt with an identifier and a transaction hash,
  clearly marked as simulated.

The comparison against the legacy rail is the part that matters in a room. It
turns an abstract claim about stablecoins into a number a finance team can react
to: this payout costs this much and lands this many days sooner.

## The commercial model

The product makes money the way good payments products do, on the spread between
what it charges and what the rail costs:

- **Platform fee.** A basis-point take rate on each payout. This is the primary
  revenue line and it scales with volume rather than transaction count.
- **FX spread.** For payouts delivered in local currency, a transparent spread on
  the conversion, shown as its own line item rather than buried.
- **Float economics.** The prefunded USDC balance is working capital. At scale,
  the yield and treasury management on that float is a second revenue line, and
  it is also the main thing a treasurer will scrutinize, so it should never be
  overstated.

Network cost is modeled as a near-zero flat fee, which is the honest description
of on-chain transfers on a low-fee settlement layer.

## What I actually built

The demo is not a slide. It runs on a real, tested money engine:

- **Integer base units.** All money is handled as integer base units, never
  floating-point. USDC at six decimals, fiat at cents. This is the first thing a
  payments engineer checks, because floating-point money is a classic source of
  reconciliation errors.
- **Pure, immutable functions.** The quote, the fee waterfall, and the baseline
  comparison are pure functions that return new values and never mutate inputs.
- **Tests.** Twenty unit tests cover the peg conversion, the fee waterfall, the
  baseline comparison, and the simulated settlement, with coverage thresholds
  enforced in the test runner.
- **Real Stripe integration.** Creating a payout calls the Stripe API in test
  mode and creates a USDC PaymentIntent, returning a genuine object id that
  resolves in the Stripe dashboard. There are no fake transaction hashes.

The repository also runs itself. Edit-time hooks format, lint, and type-check on
every change, and a nightly agent runs the test suite, opens fix and dependency
pull requests, and writes a digest, all through the Claude CLI rather than a
metered API. That is the same operational discipline I would bring to a real
codebase.

## Test mode versus live

Being precise about this is part of the credibility:

- **Test mode:** every Stripe call runs against a test-mode key, so the
  PaymentIntents are real Stripe objects you can open in the dashboard, but no
  live money moves. Pricing, FX spreads, and settlement times are illustrative.
- **Real:** the money math, the fee waterfall, the baseline comparison, the test
  suite, the Stripe integration, and the build and automation around the repo.

## What I would build next

If this moved from concept to product, the near-term roadmap is straightforward:

1. Move from a USDC PaymentIntent to a stablecoin financial account with an
   outbound transfer once that access is enabled, keeping the same quote contract.
2. Add the reconciliation view that ties each on-chain transfer back to the
   platform ledger, since reconciliation, not the transfer, is the real work.
3. Model the float as an actual balance with funding, drawdown, and a low-balance
   alert, because running out of float is the failure mode that matters.
4. Add per-country compliance and payout eligibility, which is where a product
   like this lives or dies in practice.

## About

Built by Michael Stanat. Fifteen years in payments and financial services, with
work supporting JPMorgan, Visa, Mastercard, Capital One, and American Express,
and an MS in FinTech from NYU Stern. I build payments prototypes that a person
who has actually run a treasury or a payouts operation would find credible.

Source: https://github.com/ms1ny-hue/stripe-stablecoin
