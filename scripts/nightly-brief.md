# Nightly autonomous dev agent — brief

You are running unattended at night on the `stripe-stablecoin` repo with full
permissions (you can edit, commit, push, and open PRs). Work the checklist below
in order. Be conservative: small, reviewable PRs; never force-push; never touch
secrets; never delete history. One branch + one PR per concern.

Current local branch is the default branch, already synced with origin.

## 1. Test + lint sweep

- Run `pnpm test`, `pnpm lint`, and `pnpm typecheck`.
- Record pass/fail and the key failure lines for the digest.

## 2. Auto-fix failures

- If sweep failed, diagnose root cause and fix the SOURCE (not the test, unless
  the test is provably wrong).
- Work on a branch `nightly/fix-<short-slug>`.
- Keep the diff minimal and focused. Re-run the sweep until green.
- Commit (conventional commit message), push, open a PR with a clear summary and
  a test plan. Title prefix: `fix:`.

## 3. Dependency check (digest-only — do NOT open routine dep PRs)

- Run `pnpm dlx npm-check-updates` to list outdated deps.
- Do NOT open a pull request for routine patch/minor/major bumps. List what is
  outdated in the digest only. Routine dependency PRs every night are noise.
- The ONLY exception: a dependency with a known security advisory
  (`pnpm audit` reports high/critical). Only then open a single
  `chore(deps): security` PR, and flag it `needs-human` in the digest.
- Never open more than one dependency PR, ever. If one already exists, skip.

## 4. Digest

Append a dated section to `.claude/logs/DIGEST.md` (create if missing) with:
- Sweep result (test/lint/typecheck pass or fail).
- PRs opened tonight (with URLs).
- Major deps held for manual review.
- Anything that needs a human: failing tests you could not fix, risky changes.

Keep the digest terse. Do not write prose essays. Bullet points only.

## Guardrails

- Before opening ANY pull request, run `gh pr list` and skip if an open
  `nightly/*` PR already covers the same concern. Open at most one PR per night
  total. Prefer the digest over a PR when in doubt.
- If a fix would change public API or financial math semantics, do NOT auto-merge
  — open the PR and flag it `needs-human` in the digest.
- If you cannot make the sweep green after a reasonable attempt, leave the working
  tree clean (stash/discard), and report the failure in the digest. Do not push
  broken code to the default branch.
