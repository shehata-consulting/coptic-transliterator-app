// Ported from coptic-transliterator-llm/tests/test_transliterator.py, plus
// the golden parity suite that pins this TS engine to the canonical Python
// one (regenerate golden.json with scripts/gen-golden.py).
import { describe, expect, it } from 'vitest';

import { translit, translitWithWarnings } from '../translit';
import GOLDEN from './golden.json';

// The contextual phonetic rules the engine was built around.
const PHONETIC_CASES: [string, string][] = [
  ['ⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ', 'evangelion'], // upsilon as 'v', double gamma as 'ng'
  ['ⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ', 'pandokrator'], // tav softening after ni, omega to 'o'
  ['ⲁⲙⲡⲉⲗⲟⲛ', 'ambelon'], // pi softening after mey
  ['ⲭⲉⲣⲉ', 'shere'], // chi as 'sh' before front vowel
  ['ⲭⲣⲓⲥⲧⲟⲥ', 'khristos'], // chi as 'kh' before consonant
  ['ⲛ̀ⲑⲟⲕ', 'enthok'], // jinkim over consonant becomes leading 'e'
];

const BASIC_CASES: [string, string][] = [
  ['ⲡⲛⲟⲩⲧⲉ', 'pnoute'], // ou digraph
  ['ⲧⲉⲕⲕⲗⲏⲥⲓⲁ', 'tekklesia'], // double kappa, eta as 'e'
  ['ⲙⲁⲣⲓⲁ', 'maria'],
  ['ϣⲉⲣⲉ', 'shere'], // shai
  ['ϯ', 'ti'],
];

describe('contextual phonetic rules', () => {
  it.each(PHONETIC_CASES)('%s -> %s', (coptic, expected) => {
    expect(translit(coptic)).toBe(expected);
  });
});

describe('basic mappings', () => {
  it.each(BASIC_CASES)('%s -> %s', (coptic, expected) => {
    expect(translit(coptic)).toBe(expected);
  });
});

it('empty and nullish input', () => {
  expect(translit('')).toBe('');
  expect(translit(null)).toBe('');
  expect(translit(undefined)).toBe('');
  expect(translitWithWarnings('')).toEqual({ result: '', unmapped: '' });
});

it('uppercase is lowercased', () => {
  expect(translit('Ⲙⲁⲣⲓⲁ')).toBe('maria');
});

it('whitespace and punctuation preserved', () => {
  expect(translit('ⲡⲛⲟⲩⲧⲉ, ⲙⲁⲣⲓⲁ!')).toBe('pnoute, maria!');
  expect(translit('ⲙⲁⲣⲓⲁ\nⲙⲁⲣⲓⲁ')).toBe('maria\nmaria');
});

it('output is ascii for mapped text', () => {
  for (const [coptic] of [...PHONETIC_CASES, ...BASIC_CASES]) {
    expect(translit(coptic)).toMatch(/^[\x00-\x7F]*$/);
  }
});

it('no warnings for mapped text', () => {
  expect(translitWithWarnings('ⲡⲛⲟⲩⲧⲉ')).toEqual({ result: 'pnoute', unmapped: '' });
});

it('unmapped characters reported and passed through', () => {
  // ⳁ (U+2CC1, Old Coptic sampi) has no mapping
  const { result, unmapped } = translitWithWarnings('ⲡⲛⲟⲩⲧⲉ ⳁ');
  expect(unmapped).toContain('ⳁ');
  expect(result).toContain('ⳁ');
});

it('unmapped characters deduplicated', () => {
  expect(translitWithWarnings('ⳁ ⳁ ⳁ').unmapped).toBe('ⳁ');
});

describe('golden parity with the Python engine', () => {
  it.each(GOLDEN.map((c) => [c.input, c] as const))('%s', (_input, c) => {
    expect(translitWithWarnings(c.input)).toEqual({ result: c.result, unmapped: c.unmapped });
  });
});
