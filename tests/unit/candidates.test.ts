import { describe, it, expect } from 'vitest';
import { selectCandidates, UNDATED_YEAR } from '../../scripts/lib/candidates.mjs';

describe('selectCandidates', () => {
  function book(overrides: Partial<Record<string, unknown>> = {}) {
    return { title: 'Untitled', author: 'Someone', img: '', bookId: 'id-1', rating: 0, ...overrides };
  }

  it('files a new book under the year it was rated', () => {
    const result = selectCandidates([book({ bookId: 'a' })], new Set(), new Map([['a', '2026-10-26']]));
    expect(result).toHaveLength(1);
    expect(result[0].year).toBe(2026);
    expect(result[0].dateReadIso).toBe('2026-10-26');
  });

  it('files a new book with no known date under the undated bucket', () => {
    const result = selectCandidates([book({ bookId: 'b' })], new Set(), new Map());
    expect(result[0].year).toBe(UNDATED_YEAR);
    expect(result[0].dateReadIso).toBeNull();
  });

  it('skips a known book, even one with a new rating date', () => {
    // Re-rating an old book is indistinguishable from a re-read now that
    // finish dates are gone, so this must not add a duplicate entry.
    const result = selectCandidates([book({ bookId: 'c' })], new Set(['c']), new Map([['c', '2026-10-26']]));
    expect(result).toHaveLength(0);
  });
});
