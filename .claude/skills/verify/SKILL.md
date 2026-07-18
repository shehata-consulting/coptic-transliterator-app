---
name: verify
description: Build, launch, and observe this app to verify UI/behavior changes end-to-end.
---

# Verifying coptic-transliterator-app

Expo Router web app, **no auth** — every screen is directly reachable.

## Launch

```bash
direnv exec . npx expo start --port 8083   # .envrc loads node 24 via .nvmrc
curl -s -o /dev/null -w "%{http_code}" http://localhost:8083   # 200 when up
```

First page load triggers the Metro bundle (~30s); later loads are fast.

## Screenshot

Headless Chrome's `--screenshot` fires at the `load` event, before React
settles. Use Playwright's CLI with system Chrome and a settle wait:

```bash
npx --yes playwright screenshot --browser chromium --channel chrome \
  --viewport-size "430,900" --wait-for-timeout 6000 \
  http://localhost:8083 out.png
```

## Flows worth driving

- Transliterate: type/paste Coptic → output updates live; `ⲁⲃⲅ keyboard`
  toggle → tap letters → they append; Latin ⇄ Interlinear switch; unmapped
  chars (e.g. ⳁ) surface the amber warning; Copy button (web).
- Library: five texts render with interlinear transliteration.
- Guide: full alphabet + jinkim rows.
- Engine parity itself is CI's job (`npm test` golden suite) — don't re-run
  it here; drive the UI.
