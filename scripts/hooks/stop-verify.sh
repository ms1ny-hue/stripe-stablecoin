#!/usr/bin/env bash
# Stop hook: fast end-of-session gate. Typecheck + unit tests (not full build —
# `next build` is too heavy per-Stop; that runs in the nightly agent + CI).
# Exit non-zero with a message on stderr to surface failures to the session.
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 0

fail=0

if ! timeout 90 pnpm exec tsc --noEmit --pretty false --incremental \
  --tsBuildInfoFile node_modules/.cache/tsc-stop.tsbuildinfo 2>&1 | tail -20; then
  echo "[stop-verify] typecheck failed" >&2
  fail=1
fi

if ! timeout 120 pnpm exec vitest run 2>&1 | tail -15; then
  echo "[stop-verify] tests failed" >&2
  fail=1
fi

exit $fail
