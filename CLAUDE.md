# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Expo (React Native + web) successor to the Streamlit app in the sibling repo `coptic-transliterator-llm`: a **public, offline-first PWA** that transliterates Coptic text to Latin script (Greco-Bohairic conventions) so English speakers can follow along in Coptic Orthodox services. Phase 1 is fully client-side — **no backend, no auth, no database**. Phase 2 will add optional Gemini AI enhancement via Firebase AI Logic + App Check (free tier); Phase 3 may add Firestore for community features. Same Lumen design system as net-worth-tracker and marketplace-selling.

Three tabs: **Transliterate** (live rule-based engine, on-screen Coptic keyboard, interlinear view), **Library** (liturgical texts from `texts/library.json`, community-maintained), **Guide** (letter-by-letter pronunciation).

## Commands

- `npm install`
- `npm start` — Expo dev server (`npm run ios|android|web`)
- `npm run lint` — `expo lint`
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — vitest over `src/lib` (engine + helpers + golden parity)
- `python3 scripts/gen-golden.py` — regenerate `src/lib/__tests__/golden.json` from the vendored Python engine (`scripts/reference/coptictranslit.py`). No sibling checkout needed; if `../coptic-transliterator-llm` happens to be present, the script warns when the vendored copy has drifted from it.

`lint` + `typecheck` + `test` all run in CI on push/PR; run them before pushing.

## The engine parity contract (the rule that matters most)

[src/lib/translit.ts](src/lib/translit.ts) is a line-for-line port of the canonical Python engine, vendored verbatim at [scripts/reference/coptictranslit.py](scripts/reference/coptictranslit.py) (= `coptictranslit` v2.0.0, also published to PyPI from the sibling repo). **The two engines must stay rule-identical.** Any rule change happens in BOTH engines, then `gen-golden.py` regenerates the golden file and `npm test` must pass. Never "improve" a rule on one side only — the golden suite exists to catch exactly that. The combining-marks stripping differs mechanically (Python `unicodedata.combining`, TS a block-range regex) — the golden corpus guards their equivalence; extend `EDGE_CASES` in gen-golden.py when touching it.

## AI enhancement (Phase 2)

[src/lib/ai.ts](src/lib/ai.ts) — optional Gemini pass via **Firebase AI Logic** (`GoogleAIBackend` = Gemini Developer API), same system instruction / few-shot prompt / temperature / chunking / retry / ASCII validation as the Streamlit app. Rules that matter:

- **On-demand only.** It runs when the user presses "Enhance with AI" — never automatically — so free-tier quota is never spent unasked. The rule-based result is always computed and always displayed alongside.
- **Never fatal.** `aiTransliterate` returns `null` on any failure and the UI keeps the rule-based output. AI can only ever add a second opinion.
- **Model is the rolling alias `gemini-flash-lite-latest`.** The Streamlit app's pinned `gemini-2.5-flash-lite` returns 404 "no longer available to new users" on this (newer) project. Don't pin a dated model here without checking it resolves for this project first.
- **The Gemini API key lives server-side** in the project's AI Logic config (`generativeLanguageConfig`), never in this bundle. Rotate it via the Firebase console or the `firebasevertexai …/locations/global/config` PATCH endpoint.
- **Cost:** Gemini Developer API free tier on the Spark plan. There is no billing account, so quota exhaustion degrades to `null` (rule-based fallback) — it can never produce a charge.
- **App Check** (reCAPTCHA Enterprise, site key in `firebaseConfig.ts`) initializes **lazily inside `getModel()`**, not at startup — it fetches reCAPTCHA from google.com, and the offline-first rule-based path must never depend on the network. Enforcement is set to `ENFORCED` on `firebaseml.googleapis.com` (the only service ID the App Check REST API accepts — it rejects `firebasevertexai.googleapis.com`). ⚠️ **Unconfirmed**: production AI still works with it on, but that is also what a no-op would look like, so it is not proof that this ID governs AI Logic. Confirm in the console (App Check → APIs → Firebase AI Logic should read *Enforced*) and flip it there if not. Note that real enforcement breaks local dev AI until a debug token is registered.

## Key hygiene

Two Google API keys exist for this project; know which is which:

- **Browser key** — the `apiKey` in [src/lib/firebaseConfig.ts](src/lib/firebaseConfig.ts). Public by design, ships in the bundle, safe to commit. GitHub secret scanning flags its `AIza…` shape; that alert is the expected false positive and rotating it accomplishes nothing. It is hardened via an API allowlist + HTTP referrer restrictions (Hosting domains + localhost). If you ever add a domain, add it to the key's referrer list or the app breaks there.
- **Gemini key** (`gemini-ai-logic`) — restricted to `generativelanguage.googleapis.com`, stored **server-side** in the AI Logic config. It must never appear in this repo. If it ever leaks, rotate it via the API Keys API and re-PATCH `generativeLanguageConfig`.

## Architecture

- No auth gate, no store/provider — screens are pure functions of local state. Don't add Firebase for its own sake (see the phase plan above).
- [src/lib/textUtils.ts](src/lib/textUtils.ts) — `interlinearLines` (word-pairing for the interlinear view) and `containsCoptic`. The LLM chunk/clean helpers from the Python repo intentionally NOT ported yet (Phase 2).
- [texts/library.json](texts/library.json) — same schema as the Streamlit repo's; it's the community contribution surface, keep it a flat array.
- Lumen: `GlassCard/AppBackground/PressableScale/AnimatedNumber` are byte-identical with the sibling apps — run `~/dev_personal/bin/sync-lumen.sh --check` before editing, edit in one app, `--from <that-app>`, commit everywhere. `theme.ts` shares the token object by value; `Icon.tsx` and `Screen.tsx` are app-specific.
- Render purity: `eslint-config-expo` enables React-Compiler hooks rules — no `Date.now()` in render (the `copied` timeout in index.tsx lives in an event handler, which is fine).
- PWA: [src/app/+html.tsx](src/app/+html.tsx) + [public/](public/) manifest/icons, same pattern as the siblings. Icons are the Coptic Ϯ glyph generated by PIL from NotoSansCoptic (regenerate at any size with the same recipe).
- **Offline**: [public/sw.js](public/sw.js) — network-first navigations, cache-first hashed assets, cached shell as offline fallback. Registration lives in `+html.tsx` and is **skipped on `localhost`** so dev bundles are never cached (test against `127.0.0.1` serving `dist/`, which passes the guard). Caching is runtime (first visit fills the cache within a few seconds); bump the `CACHE` name in sw.js if its logic ever changes incompatibly.

## CI & hosting

- [.github/workflows/ci.yml](.github/workflows/ci.yml) — `lint` + `typecheck` + `test` on every push to `main` and every PR. Identical across the four sibling Expo apps; keep it that way.
- **Live app:** <https://coptic-transliterator-app.web.app> — Firebase Hosting, dedicated project `coptic-transliterator-app` on the **Spark (no-cost) plan**; keep it on Spark, there is nothing here that needs billing.
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) — on every push to `main`, exports the web build (`npx expo export --platform web` → `dist/`) and deploys using the `FIREBASE_SERVICE_ACCOUNT` secret (service account `github-action-deploy@coptic-transliterator-app.iam.gserviceaccount.com`, scoped to hosting-admin on this project only). **Push = production deploy** — confirm with the user before pushing.
- `dist/` is generated; never hand-edit or commit it.
