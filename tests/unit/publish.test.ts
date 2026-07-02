import { describe, it, expect } from 'vitest';
import { isPublished } from '../../src/utils/publish';

const today = new Date(2026, 6, 2); // 2026-07-02 local time

describe('isPublished', () => {
  it('returns false when draft is true, regardless of date', () => {
    expect(isPublished(new Date(2020, 0, 1), true, today)).toBe(false);
  });

  it('returns true for a past date', () => {
    expect(isPublished(new Date(2026, 6, 1), false, today)).toBe(true);
  });

  it('returns true for today', () => {
    expect(isPublished(new Date(2026, 6, 2), false, today)).toBe(true);
  });

  it('returns false for a future date', () => {
    expect(isPublished(new Date(2026, 6, 3), false, today)).toBe(false);
  });

  it('accepts a date string', () => {
    expect(isPublished('2026-07-01', false, today)).toBe(true);
    expect(isPublished('2026-07-03', false, today)).toBe(false);
  });
});
