#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regenerate the golden parity file from the canonical Python engine.

The TypeScript engine in src/lib/translit.ts must produce byte-identical
output to `coptictranslit` — the Python package originally published from the
sibling repo coptic-transliterator-llm. This script runs the Python engine
over the text library plus a set of edge cases and writes the expected
outputs to src/lib/__tests__/golden.json, which vitest replays against the
TS port.

The engine is VENDORED at scripts/reference/coptictranslit.py (a verbatim
copy of coptictranslit v2.0.0) so this repo stands alone — the sibling repo
can be archived without breaking parity regeneration. When the sibling repo
is present next to this one, the vendored copy is checked against it and a
warning is printed on drift, so the vendored copy can never silently rot.

Run whenever either engine's rules change:
    python3 scripts/gen-golden.py
"""

import filecmp
import importlib.util
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENDORED = os.path.join(ROOT, "scripts", "reference", "coptictranslit.py")
UPSTREAM = os.path.join(
    os.path.dirname(ROOT), "coptic-transliterator-llm", "coptictranslit", "__init__.py"
)


def load_engine():
    """Import the vendored engine, warning if it has drifted from upstream."""
    if os.path.exists(UPSTREAM) and not filecmp.cmp(VENDORED, UPSTREAM, shallow=False):
        print(
            "WARNING: vendored engine differs from ../coptic-transliterator-llm.\n"
            "         Re-vendor it (cp) if upstream is newer, then rerun:\n"
            f"           cp {UPSTREAM} {VENDORED}",
            file=sys.stderr,
        )
    spec = importlib.util.spec_from_file_location("coptictranslit_ref", VENDORED)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.translit_with_warnings


EDGE_CASES = [
    # Contextual rules
    "ⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ",
    "ⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ",
    "ⲁⲙⲡⲉⲗⲟⲛ",
    "ⲭⲉⲣⲉ",
    "ⲭⲣⲓⲥⲧⲟⲥ",
    "ⲛ̀ⲑⲟⲕ",
    # Basics
    "ⲡⲛⲟⲩⲧⲉ",
    "ⲧⲉⲕⲕⲗⲏⲥⲓⲁ",
    "ⲙⲁⲣⲓⲁ",
    "ϣⲉⲣⲉ",
    "ϯ",
    # Case, punctuation, structure
    "Ⲙⲁⲣⲓⲁ",
    "ⲡⲛⲟⲩⲧⲉ, ⲙⲁⲣⲓⲁ!",
    "ⲙⲁⲣⲓⲁ\nⲙⲁⲣⲓⲁ",
    # Diacritics beyond the jinkim (supralinear stroke)
    "ⲡ̅ⲛ̅ⲟⲩⲧⲉ",
    # Unmapped characters
    "ⲡⲛⲟⲩⲧⲉ ⳁ",
    "ⳁ ⳁ ⳁ",
    # Mixed script
    "Amen ⲁⲙⲏⲛ amen",
]


def main():
    translit_with_warnings = load_engine()

    with open(os.path.join(ROOT, "texts", "library.json"), encoding="utf-8") as f:
        library = json.load(f)

    inputs = EDGE_CASES + [t["coptic"] for t in library]

    cases = []
    for text in inputs:
        result, unmapped = translit_with_warnings(text)
        cases.append({"input": text, "result": result, "unmapped": unmapped})

    out_path = os.path.join(ROOT, "src", "lib", "__tests__", "golden.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(cases, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"wrote {len(cases)} golden cases -> {out_path}")


if __name__ == "__main__":
    main()
