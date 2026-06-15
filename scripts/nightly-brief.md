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

## 3. Dependency bumps

- Run `pnpm dlx npm-check-updates` to list outdated deps.
- Apply SAFE updates only: patch + minor. Hold major bumps — instead list them
  in the digest as "manual review needed".
- After bumping, run the full sweep. Only open the PR if green.
- Branch `nightly/deps-<date>`, title prefix `chore(deps):`.

## 4. Digest

Append a dated section to `.claude/logs/DIGEST.md` (create if missing) with:
- Sweep result (test/lint/typecheck pass or fail).
- PRs opened tonight (with URLs).
- Major deps held for manual review.
- Anything that needs a human: failing tests you could not fix, risky changes.

Keep the digest terse. Do not write prose essays. Bullet points only.

## Guardrails

- If a fix would change public API or financial math semantics, do NOT auto-merge
  — open the PR and flag it `needs-human` in the digest.
- If you cannot make the sweep green after a reasonable attempt, leave the working
  tree clean (stash/discard), and report the failure in the digest. Do not push
  broken code to the default branch.
