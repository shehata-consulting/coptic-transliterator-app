// Pure text helpers, ported from coptic-transliterator-llm/text_utils.py.

// Free-tier friendly limits for AI enhancement. Gemini's free tier is what
// keeps this tool zero-cost, so long inputs are chunked and capped rather
// than sent as one oversized request.
export const LLM_CHUNK_CHARS = 4000;
export const LLM_MAX_CHUNKS = 3;
export const LLM_MAX_CHARS = LLM_CHUNK_CHARS * LLM_MAX_CHUNKS;

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

/** Split text into chunks of at most maxChars, on line boundaries when possible. */
export function chunkText(text: string, maxChars = LLM_CHUNK_CHARS): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let current = '';
  const lines = text.match(/[^\n]*\n|[^\n]+/g) ?? [];
  for (let line of lines) {
    while (line.length > maxChars) {
      // a single oversized line: hard split
      if (current) {
        chunks.push(current);
        current = '';
      }
      chunks.push(line.slice(0, maxChars));
      line = line.slice(maxChars);
    }
    if (current.length + line.length > maxChars) {
      chunks.push(current);
      current = line;
    } else {
      current += line;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Normalize an LLM response to the plain-ASCII transliteration contract.
 *
 * The system prompt demands ASCII-only output, but the model can still return
 * markdown fences, diacritics, or echo the Coptic input. Returns the cleaned
 * text, or null when the response can't be salvaged (caller should fall back
 * to the rule-based result).
 */
export function cleanLlmOutput(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let text = raw.trim();

  if (text.startsWith('```')) {
    text = text
      .replace(/^```[^\n]*\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
  }
  if (!text) return null;

  if (containsCoptic(text)) return null;

  // Decompose accented Latin (ā, ē…) into base letter + combining mark,
  // then drop everything non-ASCII.
  const decomposed = text.normalize('NFKD');
  const asciiText = [...decomposed]
    .filter((c) => (c.codePointAt(0) ?? 128) < 128)
    .join('')
    .trim();

  // Losing a lot of characters means the output wasn't a transliteration.
  if (asciiText.length < 0.8 * [...decomposed].length) return null;
  return asciiText || null;
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
