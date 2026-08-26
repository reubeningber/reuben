import { describe, it, expect } from 'vitest';
import { daysAgo, toIsoDate, selectCandidates, UNDATED_YEAR } from '../../scripts/lib/candidates.mjs';

describe('daysAgo', () => {
  it('returns ~0 for the reference time itself', () => {
    // toUTCString() truncates to whole seconds, so allow for that rounding.
    const now = Date.now();
    expect(Math.abs(daysAgo(new Date(now).toUTCString(), now))).toBeLessThan(0.001);
  });

  it('returns a positive number of days for a past date', () => {
    const now = new Date('2026-08-18T00:00:00Z').getTime();
    expect(daysAgo('2026-08-11T00:00:00Z', now)).toBeCloseTo(7, 5);
  });
});

describe('toIsoDate', () => {
  it('formats an RFC 2822 date as YYYY-MM-DD', () => {
    expect(toIsoDate('Tue, 18 Aug 2026 08:09:32 -0700')).toBe('2026-08-18');
  });
});

describe('selectCandidates', () => {
  const now = new Date('2026-08-18T00:00:00Z').getTime();

  function book(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      title: 'Untitled',
      author: 'Someone',
      isbn: null,
      img: '',
      bookId: 'id-1',
      dateRead: null,
      dateAdded: null,
      rating: 0,
      audio: false,
      ...overrides,
    };
  }

  it('adds a dated book not already known, using its dateRead year', () => {
    const dated = [book({ bookId: 'a', dateRead: 'Tue, 18 Aug 2020 00:00:00 +0000' })];
    const result = selectCandidates(dated, [], new Set(), new Set(), 14, now);
    expect(result).toHaveLength(1);
    expect(result[0].bookId).toBe('a');
    expect(result[0].dateReadIso).toBe('2020-08-18');
  });

  it('skips a dated book whose exact bookId+dateRead is already known', () => {
    const dated = [book({ bookId: 'a', dateRead: 'Tue, 18 Aug 2020 00:00:00 +0000' })];
    const result = selectCandidates(dated, [], new Set(), new Set(['a|2020-08-18']), 14, now);
    expect(result).toHaveLength(0);
  });

  it('adds a re-read: same bookId, but a dateRead not already known', () => {
    const dated = [book({ bookId: 'a', dateRead: 'Mon, 24 Aug 2026 00:00:00 +0000' })];
    const result = selectCandidates(dated, [], new Set(['a']), new Set(['a|2020-08-18']), 14, now);
    expect(result).toHaveLength(1);
    expect(result[0].dateReadIso).toBe('2026-08-24');
  });

  it('skips a shelf entry with no dateRead in the dated pass', () => {
    const dated = [book({ bookId: 'a', dateRead: null })];
    const result = selectCandidates(dated, [], new Set(), new Set(), 14, now);
    expect(result).toHaveLength(0);
  });

  it('adds an undated book only if added within the lookback window, filed under the undated bucket', () => {
    const withinWindow = book({ bookId: 'b', dateAdded: 'Sat, 15 Aug 2026 00:00:00 +0000' }); // 3 days ago
    const outsideWindow = book({ bookId: 'c', dateAdded: 'Sun, 1 Feb 2026 00:00:00 +0000' }); // way over 14 days
    const result = selectCandidates([], [withinWindow, outsideWindow], new Set(), new Set(), 14, now);
    expect(result.map((c) => c.bookId)).toEqual(['b']);
    expect(result[0].year).toBe(UNDATED_YEAR);
    expect(result[0].dateReadIso).toBeNull();
  });

  it('drops an undated book with no dateAdded at all', () => {
    const noDateAdded = book({ bookId: 'd', dateAdded: null });
    const result = selectCandidates([], [noDateAdded], new Set(), new Set(), 14, now);
    expect(result).toHaveLength(0);
  });

  it('does not double-add a book present in both shelves', () => {
    const dated = [book({ bookId: 'e', dateRead: 'Tue, 18 Aug 2020 00:00:00 +0000' })];
    const defaultOrder = [book({ bookId: 'e', dateRead: null, dateAdded: 'Sat, 15 Aug 2026 00:00:00 +0000' })];
    const result = selectCandidates(dated, defaultOrder, new Set(), new Set(), 14, now);
    expect(result).toHaveLength(1);
    expect(result[0].dateReadIso).toBe('2020-08-18'); // the dated pass wins
  });

  it('skips an already-known book in the undated pass too', () => {
    const undated = book({ bookId: 'f', dateAdded: 'Sat, 15 Aug 2026 00:00:00 +0000' });
    const result = selectCandidates([], [undated], new Set(['f']), new Set(), 14, now);
    expect(result).toHaveLength(0);
  });
});
