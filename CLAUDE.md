# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Expo (React Native + web) successor to the Streamlit app in the sibling repo `coptic-transliterator-llm`: a **public, offline-first PWA** that transliterates Coptic text to Latin script (Greco-Bohairic conventions) so English speakers can follow along in Coptic Orthodox services. Phase 1 is fully client-side — **no backend, no auth, no database**. Phase 2 will add optional Gemini AI enhancement via Firebase AI Logic + App Check (free tier); Phase 3 may add Firestore for community features. Same Lumen design system as net-worth-tracker and marketplace-selling.

Three tabs: **Transliterate** (live rule-based engine, on-screen Coptic keyboard, interlinear view), **Library** (liturgical texts from `texts/library.json`, community-maintained), **Guide** (letter-by-letter pronunciation).

## Commands

- `npm install`
- `npm start` — Expo dev server (`npm run ios|android|web`)
- `npm run lint` — `expo lint`
- `npm test` — vitest over `src/lib` (engine + helpers + golden parity)
- `python3 scripts/gen-golden.py` — regenerate `src/lib/__tests__/golden.json` from the canonical Python engine (needs the sibling repo `../coptic-transliterator-llm` checked out)

## The engine parity contract (the rule that matters most)

[src/lib/translit.ts](src/lib/translit.ts) is a line-for-line port of the canonical Python engine `coptic-transliterator-llm/coptictranslit/__init__.py`. **The two engines must stay rule-identical.** Any rule change happens in BOTH engines, then `gen-golden.py` regenerates the golden file and `npm test` must pass. Never "improve" a rule on one side only — the golden suite exists to catch exactly that. The combining-marks stripping differs mechanically (Python `unicodedata.combining`, TS a block-range regex) — the golden corpus guards their equivalence; extend `EDGE_CASES` in gen-golden.py when touching it.

## Architecture

- No auth gate, no store/provider — screens are pure functions of local state. Don't add Firebase for its own sake (see the phase plan above).
- [src/lib/textUtils.ts](src/lib/textUtils.ts) — `interlinearLines` (word-pairing for the interlinear view) and `containsCoptic`. The LLM chunk/clean helpers from the Python repo intentionally NOT ported yet (Phase 2).
- [texts/library.json](texts/library.json) — same schema as the Streamlit repo's; it's the community contribution surface, keep it a flat array.
- Lumen: `GlassCard/AppBackground/PressableScale/AnimatedNumber` are byte-identical with the sibling apps — run `~/dev_personal/bin/sync-lumen.sh --check` before editing, edit in one app, `--from <that-app>`, commit everywhere. `theme.ts` shares the token object by value; `Icon.tsx` and `Screen.tsx` are app-specific.
- Render purity: `eslint-config-expo` enables React-Compiler hooks rules — no `Date.now()` in render (the `copied` timeout in index.tsx lives in an event handler, which is fine).
- PWA: [src/app/+html.tsx](src/app/+html.tsx) + [public/](public/) manifest/icons, same pattern as the siblings. All icons are **placeholder solid-navy PNGs** — replace with real branding before launch.

## Deploy

Not wired up yet. Plan: Firebase Hosting (new dedicated Firebase project, Spark/free plan), same workflow as the siblings (`expo export --platform web` → deploy on push to `main`). Until then the Streamlit app remains the live tool.
