#!/usr/bin/env bash
# PostToolUse hook: format -> lint -> typecheck on edited files.
# Receives Claude Code tool-call JSON on stdin. Extracts the edited file path,
# acts only on source files, and never blocks the session on style nits.
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 0

IN="$(cat)"
FILE="$(node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{try{const j=JSON.parse(d);process.stdout.write(j.tool_input?.file_path||j.tool_input?.path||"")}catch{process.stdout.write("")}})' <<<"$IN")"

[ -z "$FILE" ] && exit 0
[ -f "$FILE" ] || exit 0

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.css|*.md)
    pnpm exec prettier --write "$FILE" >/dev/null 2>&1 || true
    ;;
esac

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx)
    pnpm exec eslint --fix "$FILE" >/dev/null 2>&1 || true
    # Project-wide incremental typecheck, reaped if it hangs.
    timeout 60 pnpm exec tsc --noEmit --pretty false --incremental \
      --tsBuildInfoFile node_modules/.cache/tsc-hook.tsbuildinfo 2>&1 \
      | tail -20 || true
    ;;
esac

exit 0
