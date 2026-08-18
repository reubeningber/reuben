import { describe, it, expect } from 'vitest';
import { classify, GENRES } from '../../scripts/lib/genre.mjs';

describe('classify', () => {
  it('returns null for missing or empty subjects', () => {
    expect(classify(null)).toBeNull();
    expect(classify(undefined)).toBeNull();
    expect(classify([])).toBeNull();
  });

  it('returns null when no subject matches any rule', () => {
    expect(classify(['Recreation', 'Large type books'])).toBeNull();
  });

  it('picks the single matching genre', () => {
    expect(classify(['Biography', 'New York Times bestseller'])).toBe('Biography');
  });

  it('does not misclassify "nonfiction" tags as Fiction (word-boundary regression)', () => {
    // "nyt:paperback-nonfiction=..." contains the literal substring "fiction"
    // inside "nonfiction" — a naive .includes("fiction") match used to
    // false-positive here.
    expect(classify(['nyt:paperback-nonfiction=2023-05-14', 'New York Times bestseller'])).toBeNull();
  });

  it('prefers the more specific "science fiction" over "science" (longest-match regression)', () => {
    // "science" is a substring of "science fiction", so whichever rule is
    // checked first used to win regardless of specificity; longest-match
    // scoring fixes that.
    expect(classify(['Fiction', 'Fiction, science fiction, general'])).toBe('Science Fiction');
  });

  it('still classifies plain science subjects as Science', () => {
    expect(classify(['Physics', 'Popular science'])).toBe('Science');
  });

  it('is case-insensitive', () => {
    expect(classify(['BUSINESS & ECONOMICS', 'ECONOMICS'])).toBe('Business');
  });

  it('breaks ties using the more specific genre (RULES order)', () => {
    // Both "Personal narratives" (Memoir) and "Psychology" occur once each;
    // Memoir is listed before Psychology in RULES, so it should win the tie.
    expect(classify(['Personal narratives', 'Psychology'])).toBe('Memoir');
  });

  it('picks the genre with the most matching subjects', () => {
    const subjects = ['Psychology', 'Psychological aspects', 'Change (Psychology)', 'Personal narratives'];
    expect(classify(subjects)).toBe('Psychology');
  });

  it('does not match a keyword embedded in an unrelated word', () => {
    // "art" should not match inside "part", "biography" should not match
    // inside "autobiography-adjacent" style false substrings.
    expect(classify(['Departure', 'Partnership'])).toBeNull();
  });

  it('every classifiable genre is present in the exported GENRES list', () => {
    const samples: Array<[string[], string]> = [
      [['Memoir'], 'Memoir'],
      [['True crime'], 'True Crime'],
      [['Self-help'], 'Self-Help'],
      [['Health', 'Fitness'], 'Health & Fitness'],
      [['Sports'], 'Sports'],
      [['Parenting'], 'Parenting'],
      [['Politics'], 'Politics'],
      [['History'], 'History'],
      [['Religion'], 'Religion & Spirituality'],
      [['Humor'], 'Humor'],
      [['Travel'], 'Travel'],
      [['Essays'], 'Essays'],
      [['Poetry'], 'Poetry'],
      [['Graphic novel'], 'Graphic Novel'],
      [['Young adult fiction'], 'Young Adult'],
      [["Juvenile fiction"], "Children's"],
      [['Fantasy'], 'Fantasy'],
      [['Mystery fiction'], 'Mystery & Thriller'],
      [['Fiction'], 'Fiction'],
    ];
    for (const [subjects, expected] of samples) {
      expect(classify(subjects)).toBe(expected);
      expect(GENRES).toContain(expected);
    }
  });
});
