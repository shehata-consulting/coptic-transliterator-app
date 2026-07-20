// Ported from coptic-transliterator-llm/tests/test_text_utils.py.
import { describe, expect, it } from 'vitest';

import { chunkText, cleanLlmOutput, containsCoptic, interlinearLines } from '../textUtils';

describe('containsCoptic', () => {
  it('detects coptic', () => {
    expect(containsCoptic('ⲡⲛⲟⲩⲧⲉ')).toBe(true);
    expect(containsCoptic('mixed ⲁ text')).toBe(true);
  });

  it('plain latin is clean', () => {
    expect(containsCoptic('pnoute agape')).toBe(false);
    expect(containsCoptic('')).toBe(false);
  });
});

describe('chunkText', () => {
  it('short text single chunk', () => {
    expect(chunkText('hello', 100)).toEqual(['hello']);
  });

  it('splits on line boundaries', () => {
    const text = 'aaa\nbbb\nccc\n';
    const chunks = chunkText(text, 8);
    expect(chunks.every((c) => c.length <= 8)).toBe(true);
    expect(chunks.join('')).toBe(text);
  });

  it('oversized single line hard splits', () => {
    const text = 'x'.repeat(25);
    const chunks = chunkText(text, 10);
    expect(chunks.every((c) => c.length <= 10)).toBe(true);
    expect(chunks.join('')).toBe(text);
  });

  it('content always preserved', () => {
    const text = 'ⲡⲛⲟⲩⲧⲉ ⲙⲁⲣⲓⲁ\n'.repeat(50);
    expect(chunkText(text, 64).join('')).toBe(text);
  });
});

describe('cleanLlmOutput', () => {
  it('plain output passes through', () => {
    expect(cleanLlmOutput('pnoute maria')).toBe('pnoute maria');
  });

  it('strips whitespace', () => {
    expect(cleanLlmOutput('  pnoute \n')).toBe('pnoute');
  });

  it('strips markdown fences', () => {
    expect(cleanLlmOutput('```\npnoute\n```')).toBe('pnoute');
    expect(cleanLlmOutput('```text\npnoute\n```')).toBe('pnoute');
  });

  it('removes diacritics', () => {
    expect(cleanLlmOutput('pnoutē mārya')).toBe('pnoute marya');
  });

  it('rejects coptic echo', () => {
    expect(cleanLlmOutput('ⲡⲛⲟⲩⲧⲉ')).toBeNull();
  });

  it('rejects empty', () => {
    expect(cleanLlmOutput('')).toBeNull();
    expect(cleanLlmOutput(null)).toBeNull();
    expect(cleanLlmOutput('```\n```')).toBeNull();
  });

  it('rejects mostly non-ascii', () => {
    expect(cleanLlmOutput('日本語のテキストです')).toBeNull();
  });
});

describe('interlinearLines', () => {
  it('word pairs when counts match', () => {
    expect(interlinearLines('ⲁ ⲃ', 'a b')).toEqual([
      [
        ['ⲁ', 'a'],
        ['ⲃ', 'b'],
      ],
    ]);
  });

  it('falls back to line pair on mismatch', () => {
    expect(interlinearLines('ⲁ ⲃ ⲅ', 'a b')).toEqual([[['ⲁ ⲃ ⲅ', 'a b']]]);
  });

  it('multiline', () => {
    expect(interlinearLines('ⲁ ⲃ\nⲅ', 'a b\ng')).toEqual([
      [
        ['ⲁ', 'a'],
        ['ⲃ', 'b'],
      ],
      [['ⲅ', 'g']],
    ]);
  });

  it('blank lines become spacers', () => {
    expect(interlinearLines('ⲁ\n\nⲃ', 'a\n\nb')).toEqual([[['ⲁ', 'a']], [], [['ⲃ', 'b']]]);
  });

  it('missing translit line', () => {
    const lines = interlinearLines('ⲁ\nⲃ', 'a');
    expect(lines[0]).toEqual([['ⲁ', 'a']]);
    expect(lines[1]).toEqual([['ⲃ', '']]);
  });
});
