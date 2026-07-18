// Rule-based Coptic → Latin transliteration (Greco-Bohairic conventions).
//
// Line-for-line TypeScript port of the canonical Python engine
// (coptic-transliterator-llm/coptictranslit/__init__.py v2.0.0). Parity is
// enforced by src/lib/__tests__/golden.json — regenerate it with
// scripts/gen-golden.py whenever either engine changes, and keep the two
// engines rule-identical.

// Streamlined to lowercase only. ⲭ (Chi) is fully handled by contextual rules.
const CHAR_MAP: [string, string][] = [
  ['ⲁ', 'a'],
  ['ⲃ', 'b'],
  ['ⲅ', 'g'],
  ['ⲇ', 'd'],
  ['ⲉ', 'e'],
  ['ⲍ', 'z'],
  // Standardized to 'e' to match LLM examples (like tekklesia)
  ['ⲏ', 'e'],
  ['ⲑ', 'th'],
  ['ⲓ', 'i'],
  ['ⲕ', 'k'],
  ['ⲗ', 'l'],
  ['ⲙ', 'm'],
  ['ⲛ', 'n'],
  ['ⲝ', 'x'],
  ['ⲟ', 'o'],
  ['ⲡ', 'p'],
  ['ⲣ', 'r'],
  ['ⲥ', 's'],
  ['ⲧ', 't'],
  ['ⲩ', 'u'],
  ['ⲫ', 'ph'],
  ['ⲯ', 'ps'],
  ['ⲱ', 'o'], // ASCII representation of Omega
  ['ϣ', 'sh'],
  ['ϥ', 'f'],
  ['ϧ', 'kh'],
  ['ϩ', 'h'],
  ['ϫ', 'j'],
  ['ϭ', 'ch'], // Shima is standardly mapped to ch (as in church)
  ['ϯ', 'ti'],
  ['ⲋ', '6'], // Soou is the number 6, not 'f'
];

// Python strips characters where unicodedata.combining(c) != 0. The combining
// diacritic blocks below all carry a nonzero canonical combining class, which
// covers every mark that occurs in Coptic text (jinkim U+0300, overline
// U+0305, half marks U+FE24–FE26); golden-file parity guards the equivalence.
const COMBINING_MARKS = /[̀-ͯ᪰-᫿᷀-᷿⃐-⃿︠-︯]/g;

const isCopticCodepoint = (c: string) => {
  const cp = c.codePointAt(0) ?? 0;
  return (cp >= 0x2c80 && cp <= 0x2cff) || (cp >= 0x03e2 && cp <= 0x03ef);
};

/** Context-sensitive rules based on Greco-Bohairic pronunciation. */
function applyContextualRules(text: string): string {
  // Upsilon (ⲩ) contextual rules - must happen before Alpha/Ei mappings
  // ⲩ -> v after ⲁ (a) or ⲉ (e)
  text = text.replace(/([ⲁⲉ])ⲩ/g, '$1v');

  // Standardize Ou early
  text = text.replace(/ⲟⲩ/g, 'ou'); // ⲟⲩ -> ou

  // Veeta (ⲃ) contextual rules
  text = text.replace(/ⲃ(?=[ⲁⲉⲓⲏⲟⲩⲱ])/g, 'v'); // ⲃ -> v before vowels
  text = text.replace(/ⲃ/g, 'b'); // ⲃ -> b elsewhere

  // Gamma (ⲅ) contextual rules
  // ⲅ -> n before another ⲅ (ng)
  text = text.replace(/ⲅ(?=ⲅ)/g, 'n');
  // ⲅ -> g before front vowels
  text = text.replace(/ⲅ(?=[ⲓⲉⲏⲩ])/g, 'g');
  text = text.replace(/ⲅ/g, 'gh'); // ⲅ -> gh elsewhere

  // Chi (ⲭ) contextual rules
  // ⲭ -> sh before front vowels
  text = text.replace(/ⲭ(?=[ⲉⲏⲓⲩ])/g, 'sh');
  text = text.replace(/ⲭ/g, 'kh'); // ⲭ -> kh elsewhere

  // Consonant softening rules (Greek influence)
  // ⲧ -> d after ⲛ (e.g., Pantokrator -> Pandokrator)
  text = text.replace(/(?<=ⲛ)ⲧ/g, 'd');
  // ⲡ -> b after ⲙ (e.g., Ampelon -> Ambelon)
  text = text.replace(/(?<=ⲙ)ⲡ/g, 'b');

  // Multi-character sequences (double consonants)
  text = text.replace(/ⲕⲕ/g, 'kk');
  text = text.replace(/ⲙⲙ/g, 'mm');
  text = text.replace(/ⲛⲛ/g, 'nn');

  return text;
}

/**
 * Transliterate Coptic text to Latin script.
 *
 * Returns { result, unmapped } where unmapped is a string of distinct Coptic
 * characters that had no mapping and passed through unchanged — callers
 * (e.g. the UI) decide how to surface them.
 */
export function translitWithWarnings(text: string | null | undefined): {
  result: string;
  unmapped: string;
} {
  if (!text) return { result: '', unmapped: '' };

  // 1. Normalize input to decompose combining characters and lowercase immediately
  let t = text.normalize('NFKD').toLowerCase();

  // 2. Handle the Jinkim (grave accent ̀) before stripping other diacritics.
  // When over a consonant, it adds an 'e' sound before it (e.g., ⲛ̀ -> en).
  t = t.replace(/([ⲃⲅⲇⲍⲑⲕⲗⲙⲛⲝⲡⲣⲥⲧⲫⲭⲯϣϥϧϩϫϭϯ])̀/g, 'e$1');

  // 3. Remove any remaining combining diacritics (e.g., supralinear strokes over vowels)
  t = t.replace(COMBINING_MARKS, '');

  // 4. Apply advanced contextual phonetic rules
  let result = applyContextualRules(t);

  // 5. Apply basic character mappings for everything else
  for (const [coptic, latin] of CHAR_MAP) {
    result = result.split(coptic).join(latin);
  }

  // 6. Collect unmapped Coptic characters (Unicode blocks 2C80-2CFF and 03E2-03EF)
  const unmapped = [...new Set([...result].filter(isCopticCodepoint))].join('');

  return { result, unmapped };
}

/** Transliterate Coptic text to Latin script. */
export function translit(text: string | null | undefined): string {
  return translitWithWarnings(text).result;
}
