# Automation — how this repo runs itself

This repo is wired so the `claude` CLI (subscription, **no metered API**) does the
mechanical dev work. Three layers.

## 1. Edit-time hooks (`.claude/settings.json`)

Run automatically while you work in Claude Code:

| Event | Script | Does |
| --- | --- | --- |
| `PostToolUse` (Write/Edit) | `scripts/hooks/post-edit.sh` | prettier → eslint --fix → incremental tsc on the edited file |
| `Stop` (session end) | `scripts/hooks/stop-verify.sh` | typecheck + `vitest run`, fails loudly if red |

Hooks are timeout-capped so a stuck `tsc` gets reaped instead of piling up.

## 2. Nightly autonomous agent (`scripts/nightly-agent.sh`)

Scheduled via Claude Code's cron (see below). Each night it:

1. Syncs the default branch.
2. Runs the brief in `scripts/nightly-brief.md` through `claude -p` with full
   autonomy (`--dangerously-skip-permissions`): test+lint sweep, auto-fix PRs,
   safe dependency bumps, and a digest.
3. Writes a digest to `.claude/logs/DIGEST.md` and run logs to `.claude/logs/`.

**Full-auto**: the agent commits, pushes branches, and opens PRs by itself. It
does **not** auto-merge. Major dep bumps and API/financial-math changes are
flagged `needs-human` instead of merged.

### Kill switch

```bash
touch ~/projects/stripe-stablecoin/.PAUSE   # disarm: nightly run exits immediately
rm    ~/projects/stripe-stablecoin/.PAUSE   # re-arm
```

### Run it manually

```bash
~/projects/stripe-stablecoin/scripts/nightly-agent.sh
tail -f ~/projects/stripe-stablecoin/.claude/logs/run-*.log
```

## 3. Scheduling

The nightly job is registered as a Claude Code scheduled agent (cron). Manage it
with the `/schedule` skill or by editing the cron entry. Default cadence: 02:00
local, nightly.

## Local dev commands

```bash
pnpm dev          # next dev (turbopack)
pnpm test         # vitest run
pnpm test:cov     # coverage, 80% thresholds enforced
pnpm typecheck    # tsc --noEmit (incremental)
pnpm lint         # eslint
pnpm format       # prettier --write .
pnpm build        # production build
```
