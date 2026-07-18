// Community-maintained liturgical text library. The JSON is the contribution
// surface (same schema as coptic-transliterator-llm/texts/library.json) —
// keep it a flat array so PRs stay trivial.
import LIBRARY_JSON from '../../texts/library.json';

export interface LibraryText {
  title: string;
  coptic: string;
  meaning: string;
  occasion: string;
}

export const LIBRARY: LibraryText[] = LIBRARY_JSON;
