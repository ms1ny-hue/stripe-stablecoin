#!/usr/bin/env bash
# Nightly autonomous dev agent for stripe-stablecoin.
# Routes through the `claude` CLI (subscription, no API metering).
# Full-auto: edits, commits, pushes, opens PRs. Gated by a kill switch.
set -uo pipefail

# --- env: cron/launchd start with a minimal PATH; set it explicitly ---
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="${HOME:-/Users/michael}"

REPO="$HOME/projects/stripe-stablecoin"
cd "$REPO" || { echo "repo missing: $REPO" >&2; exit 1; }

# --- kill switch: `touch ~/projects/stripe-stablecoin/.PAUSE` to disarm ---
if [ -f "$REPO/.PAUSE" ]; then
  echo "[nightly] .PAUSE present — skipping run"
  exit 0
fi

LOG_DIR="$REPO/.claude/logs"
mkdir -p "$LOG_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_LOG="$LOG_DIR/run-$STAMP.log"

{
  echo "=== nightly run $STAMP ==="

  # --- sync default branch ---
  DEFAULT_BRANCH="$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@')"
  DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"
  git fetch origin --quiet || true
  git checkout "$DEFAULT_BRANCH" --quiet 2>/dev/null || true
  git pull --ff-only --quiet origin "$DEFAULT_BRANCH" 2>/dev/null || true

  # --- install in case lockfile moved ---
  pnpm install --frozen-lockfile 2>&1 | tail -3 || pnpm install 2>&1 | tail -3

  # --- run the agent with full autonomy, no metered API ---
  BRIEF="$(cat "$REPO/scripts/nightly-brief.md")"
  claude \
    --dangerously-skip-permissions \
    --permission-mode bypassPermissions \
    --output-format text \
    -p "$BRIEF"

  echo "=== done $STAMP exit=$? ==="
} >"$RUN_LOG" 2>&1

# keep only the last 30 run logs
ls -1t "$LOG_DIR"/run-*.log 2>/dev/null | tail -n +31 | xargs -I{} rm -f {} 2>/dev/null || true

echo "[nightly] complete — log: $RUN_LOG"
