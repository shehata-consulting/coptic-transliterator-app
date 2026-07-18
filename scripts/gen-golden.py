#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regenerate the golden parity file from the canonical Python engine.

The TypeScript engine in src/lib/translit.ts must produce byte-identical
output to coptictranslit (the Python package in the sibling repo
coptic-transliterator-llm). This script runs the Python engine over the
text library plus a set of edge cases and writes the expected outputs to
src/lib/__tests__/golden.json, which vitest replays against the TS port.

Run whenever either engine's rules change:
    python3 scripts/gen-golden.py
"""

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIBLING = os.path.join(os.path.dirname(ROOT), "coptic-transliterator-llm")
sys.path.insert(0, SIBLING)

from coptictranslit import translit_with_warnings  # noqa: E402

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
