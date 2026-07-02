import { describe, it, expect } from 'vitest';
import { createExcerpt, slugifyCategory } from '../../src/utils/content';

describe('createExcerpt', () => {
  it('returns short bodies unchanged', () => {
    expect(createExcerpt('A short sentence.')).toBe('A short sentence.');
  });

  it('strips frontmatter, markdown formatting, and collapses newlines', () => {
    const body = `---\ntitle: Ignored\n---\n# Heading\nThis has **bold**, *italic*, a [link](https://example.com), and \`code\`.\n\nMore text.`;
    expect(createExcerpt(body, 200)).toBe(
      'Heading This has bold, italic, a link, and code. More text.'
    );
  });

  it('truncates long text at a word boundary with an ellipsis', () => {
    const body = 'one two three four five six seven eight nine ten';
    const excerpt = createExcerpt(body, 20);
    expect(excerpt.endsWith('...')).toBe(true);
    expect(excerpt.length).toBeLessThanOrEqual(23);
    expect(excerpt).not.toContain(' ...'.repeat(2));
  });

  it('falls back to hard truncation when there is no word boundary', () => {
    const body = 'supercalifragilisticexpialidocious';
    expect(createExcerpt(body, 10)).toBe('supercalif...');
  });
});

describe('slugifyCategory', () => {
  it('lowercases and dashes spaces', () => {
    expect(slugifyCategory('Engineering Management')).toBe('engineering-management');
  });

  it('collapses multiple spaces', () => {
    expect(slugifyCategory('Books   & Reading')).toBe('books-&-reading');
  });

  it('leaves single-word categories lowercase', () => {
    expect(slugifyCategory('ADHD')).toBe('adhd');
  });
});
