// Pure text helpers, ported from coptic-transliterator-llm/text_utils.py.
// The LLM chunking/cleaning helpers stay in Python until Phase 2 (AI
// enhancement) lands here.

// Coptic Unicode blocks: main block + the Coptic letters inside Greek block
const COPTIC_RANGES: [number, number][] = [
  [0x2c80, 0x2cff],
  [0x03e2, 0x03ef],
];

/** True if any character falls in the Coptic Unicode ranges. */
export function containsCoptic(text: string): boolean {
  for (const c of text) {
    const cp = c.codePointAt(0) ?? 0;
    if (COPTIC_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)) return true;
  }
  return false;
}

/** One interlinear word pair: [source_word, latin_word]. */
export type InterlinearPair = [string, string];

/**
 * Pair source and transliterated words line by line for interlinear display.
 *
 * Returns a list of lines. Each line is a list of [source_word, latin_word]
 * pairs when the word counts match, a single [source_line, latin_line] pair
 * when they don't, or an empty list for a blank spacer line.
 */
export function interlinearLines(sourceText: string, translitText: string): InterlinearPair[][] {
  const srcLines = sourceText.split('\n');
  const latLines = translitText.split('\n');

  const lines: InterlinearPair[][] = [];
  srcLines.forEach((src, i) => {
    const lat = i < latLines.length ? latLines[i] : '';
    const srcWords = src.split(/\s+/).filter(Boolean);
    const latWords = lat.split(/\s+/).filter(Boolean);
    if (srcWords.length > 0 && srcWords.length === latWords.length) {
      lines.push(srcWords.map((w, j) => [w, latWords[j]] as InterlinearPair));
    } else if (src.trim() || lat.trim()) {
      lines.push([[src.trim(), lat.trim()]]);
    } else {
      lines.push([]);
    }
  });
  return lines;
}
