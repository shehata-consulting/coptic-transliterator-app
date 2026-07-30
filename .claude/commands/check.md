---
description: Run lint + typecheck + tests on the working changes, then review the diff
allowed-tools: Bash(npm run lint *), Bash(npm run typecheck *), Bash(npm test *), Bash(git diff *), Bash(git status *), Read, Grep, Glob
---
Run this repo's pre-commit check on the current working changes, then review them. Do not commit or push.

## 1. Checks — run in order, stop at the first hard failure
- `npm run lint`
- `npm run typecheck`
- `npm test`

If any fail: summarize what failed, propose the fix, and **stop here** — don't review a red tree.

## 2. Review — only if all three pass
Review the working diff as a fresh reviewer who did NOT write it:
- `git status --short` for new/untracked files; `git diff` and `git diff --staged` for the changes.
- Look for: correctness and edge cases the tests miss; anything that breaks a rule documented in CLAUDE.md (render purity, byte-identical shared files, per-filer tax invariants, offline-first, engine parity — whichever apply to this repo); accidental scope — debug logging, stray files, committed secrets.

Report findings ranked most-serious first; if the diff is clean, say so in one line. For a deeper, independent multi-agent pass, run `/code-review`.
