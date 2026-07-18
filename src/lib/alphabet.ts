// Alphabet palette + pronunciation guide, ported from the Streamlit app
// (coptic-transliterator-llm/app.py). Greco-Bohairic conventions as used in
// Coptic Orthodox services.

export interface CopticLetter {
  coptic: string;
  name: string;
  latin: string;
  soundsLike: string;
}

export const ALPHABET: CopticLetter[] = [
  { coptic: 'ⲁ', name: 'Alpha', latin: 'a', soundsLike: '[ɑː] as in “mark”' },
  { coptic: 'ⲃ', name: 'Vita', latin: 'v / b', soundsLike: '“v” before vowels, “b” elsewhere' },
  { coptic: 'ⲅ', name: 'Gamma', latin: 'g / gh / n', soundsLike: '“g” before front vowels, “n” before ⲅ, “gh” elsewhere' },
  { coptic: 'ⲇ', name: 'Delta', latin: 'd', soundsLike: '[d] as in “day”' },
  { coptic: 'ⲉ', name: 'Eie', latin: 'e', soundsLike: '[ɛ] as in “send”' },
  { coptic: 'ⲋ', name: 'Soou', latin: '6', soundsLike: 'the numeral six' },
  { coptic: 'ⲍ', name: 'Zeta', latin: 'z', soundsLike: '[z] as in “zoo”' },
  { coptic: 'ⲏ', name: 'Eta', latin: 'e', soundsLike: '[ɛ] as in “send”' },
  { coptic: 'ⲑ', name: 'Theta', latin: 'th', soundsLike: '[θ] as in “thanks”' },
  { coptic: 'ⲓ', name: 'Iota', latin: 'i', soundsLike: '[i] as in “eat”' },
  { coptic: 'ⲕ', name: 'Kappa', latin: 'k', soundsLike: '[k] as in “key”' },
  { coptic: 'ⲗ', name: 'Laula', latin: 'l', soundsLike: '[l] as in “lion”' },
  { coptic: 'ⲙ', name: 'Mey', latin: 'm', soundsLike: '[m] as in “may”' },
  { coptic: 'ⲛ', name: 'Ney', latin: 'n', soundsLike: '[n] as in “no”' },
  { coptic: 'ⲝ', name: 'Eksi', latin: 'x', soundsLike: '[ks] as in “taxi”' },
  { coptic: 'ⲟ', name: 'O', latin: 'o', soundsLike: '[oʊ] as in “code”' },
  { coptic: 'ⲡ', name: 'Pi', latin: 'p', soundsLike: '[p] as in “pizza”, “b” after ⲙ' },
  { coptic: 'ⲣ', name: 'Ro', latin: 'r', soundsLike: '[r] as in “rope”' },
  { coptic: 'ⲥ', name: 'Sima', latin: 's', soundsLike: '[s] as in “see”' },
  { coptic: 'ⲧ', name: 'Tav', latin: 't', soundsLike: '[t] as in “time”, “d” after ⲛ' },
  { coptic: 'ⲩ', name: 'Epsilon', latin: 'u / v', soundsLike: '“v” after ⲁ/ⲉ, “ou” in ⲟⲩ' },
  { coptic: 'ⲫ', name: 'Phi', latin: 'ph', soundsLike: '[f] as in “Phil”' },
  { coptic: 'ⲭ', name: 'Khi', latin: 'kh / sh', soundsLike: '“sh” before front vowels, [x] elsewhere' },
  { coptic: 'ⲯ', name: 'Epsi', latin: 'ps', soundsLike: '[ps] as in “wraps”' },
  { coptic: 'ⲱ', name: 'Omega', latin: 'o', soundsLike: '[oʊ] as in “code”' },
  { coptic: 'ϣ', name: 'Shai', latin: 'sh', soundsLike: '[ʃ] as in “she”' },
  { coptic: 'ϥ', name: 'Fai', latin: 'f', soundsLike: '[f] as in “fun”' },
  { coptic: 'ϧ', name: 'Khai', latin: 'kh', soundsLike: '[x], guttural “kh”' },
  { coptic: 'ϩ', name: 'Hori', latin: 'h', soundsLike: '[h] as in “happy”' },
  { coptic: 'ϫ', name: 'Janja', latin: 'j', soundsLike: '[dʒ] as in “joy”' },
  { coptic: 'ϭ', name: 'Chima', latin: 'ch', soundsLike: '[tʃ] as in “church”' },
  { coptic: 'ϯ', name: 'Ti', latin: 'ti', soundsLike: '[ti] as in “tea”' },
];

/** The jinkim isn't a letter, but belongs in the pronunciation guide. */
export const JINKIM: CopticLetter = {
  coptic: '◌̀',
  name: 'Jinkim',
  latin: 'e',
  soundsLike: 'adds an “e” sound before the consonant it sits on',
};
