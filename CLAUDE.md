# stripe-stablecoin — conventions

Next.js (App Router) + TypeScript + Stripe. Money is handled as integer base
units via `src/lib/stablecoin.ts` — never floats on money.

## Rules

- Pure, immutable functions for money math. Return new objects; never mutate.
- Validate at boundaries. Throw typed errors (`TypeError`, `RangeError`).
- Tests first for `src/lib/**`. Keep coverage ≥ 80% (`pnpm test:cov`).
- Never commit secrets. Use `.env.local` (see `.env.example`).

## Before done

`pnpm format && pnpm lint && pnpm typecheck && pnpm test` must be green.
Edit-time hooks run format/lint/typecheck automatically — see `AUTOMATION.md`.

## Commits

Conventional commits: `feat:`, `fix:`, `chore(deps):`, `refactor:`, `test:`.
