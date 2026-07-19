# 🔤 Coptic Transliterator

> An offline-first web & mobile app that transliterates Coptic text to Latin script (Greco-Bohairic conventions), so English speakers can follow along with Coptic Orthodox services. The successor to the [Streamlit tool](https://github.com/shehata-consulting/coptic-transliterator-llm), rebuilt as an Expo PWA.

## ✨ Features

- **⚡ Instant, offline transliteration** — the rule engine runs entirely on your device; nothing is sent anywhere and it works with no connection (pew-proof).
- **📖 Interlinear view** — each Latin word rendered directly under its Coptic word.
- **⌨️ On-screen Coptic keyboard** — type Coptic with no special keyboard installed, including the jinkim.
- **📚 Text Library** — common liturgical texts, community-maintained in [`texts/library.json`](texts/library.json) (PRs welcome — it's a flat JSON array).
- **🗣️ Pronunciation guide** — letter-by-letter Greco-Bohairic reference with context-sensitive variants.
- **🏠 Installable PWA** — add to home screen for an app-like experience.

AI-enhanced transliteration (Gemini via Firebase AI Logic) is planned as an optional Phase 2 — the rule engine always remains the offline fallback.

## The engine

[`src/lib/translit.ts`](src/lib/translit.ts) is a line-for-line TypeScript port of the canonical Python engine [`coptictranslit`](https://github.com/shehata-consulting/coptic-transliterator-llm) v2.0.0. The two are pinned **byte-identical** by a golden parity suite: [`scripts/gen-golden.py`](scripts/gen-golden.py) runs the Python engine over the text library + edge cases and the vitest suite replays the results against the TS port. Rule changes must land in both engines together.

## Development

```bash
npm install
npm start          # Expo dev server (npm run web|ios|android)
npm run lint
npm test           # engine + helpers + golden parity
```

Requires Node 24 (`.nvmrc`; direnv sets it up automatically in this workspace).

## Citation

If you use the transliteration rules in research, please cite:

> [Coptic Transliteration Tool](https://github.com/shehata-consulting/coptic-transliterator/blob/master/Coptic%20Transliteration%20Tool.pdf), May 2020, Michael Shehata, Montclair State University of New Jersey, U.S.

## License

MIT — see the sibling repos.
