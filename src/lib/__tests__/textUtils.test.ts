// Ported from coptic-transliterator-llm/tests/test_text_utils.py (the LLM
// chunk/clean helpers stay in Python until Phase 2).
import { describe, expect, it } from 'vitest';

import { containsCoptic, interlinearLines } from '../textUtils';

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
