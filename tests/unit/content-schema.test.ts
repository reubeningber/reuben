import { describe, it, expect } from 'vitest';
import { collections } from '../../src/content/config';

const postsSchema = collections.posts.schema as import('zod').ZodTypeAny;
const fieldNotesSchema = collections['field-notes'].schema as import('zod').ZodTypeAny;

describe('posts collection schema', () => {
  it('accepts a minimal valid post', () => {
    const result = postsSchema.safeParse({ title: 'Hello', pubDate: '2026-01-01' });
    expect(result.success).toBe(true);
  });

  it('defaults draft to false when omitted', () => {
    const result = postsSchema.safeParse({ title: 'Hello', pubDate: '2026-01-01' });
    expect(result.success && result.data.draft).toBe(false);
  });

  it('rejects a post missing a title', () => {
    expect(postsSchema.safeParse({ pubDate: '2026-01-01' }).success).toBe(false);
  });

  it('rejects a post missing a pubDate', () => {
    expect(postsSchema.safeParse({ title: 'Hello' }).success).toBe(false);
  });

  it('rejects a pubDate that is not a valid date', () => {
    expect(postsSchema.safeParse({ title: 'Hello', pubDate: 'not-a-date' }).success).toBe(false);
  });

  it('accepts all optional fields together', () => {
    const result = postsSchema.safeParse({
      title: 'Hello',
      subTitle: 'A subtitle',
      pubDate: '2026-01-01',
      updatedDate: '2026-01-02',
      draft: true,
      image: 'web_assets/foo.jpg',
      imageAlt: 'alt text',
      imageCredit: 'someone',
      imageCreditUrl: 'https://example.com',
      category: 'Fatherhood',
      description: 'A description',
      tags: ['a', 'b'],
      canonicalURL: 'https://example.com/canonical',
    });
    expect(result.success).toBe(true);
  });
});

describe('field-notes collection schema', () => {
  it('accepts a minimal valid link-type entry', () => {
    const result = fieldNotesSchema.safeParse({
      title: 'A link',
      pubDate: '2026-01-01',
      type: 'link',
      url: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('defaults draft to false when omitted', () => {
    const result = fieldNotesSchema.safeParse({ title: 'A link', pubDate: '2026-01-01', type: 'link' });
    expect(result.success && result.data.draft).toBe(false);
  });

  it('rejects an invalid type', () => {
    const result = fieldNotesSchema.safeParse({ title: 'X', pubDate: '2026-01-01', type: 'video' });
    expect(result.success).toBe(false);
  });

  it('accepts each valid type without requiring type-specific fields', () => {
    for (const type of ['link', 'image', 'embed', 'slideshow']) {
      const result = fieldNotesSchema.safeParse({ title: 'X', pubDate: '2026-01-01', type });
      expect(result.success).toBe(true);
    }
  });

  it('rejects a malformed url', () => {
    const result = fieldNotesSchema.safeParse({
      title: 'X',
      pubDate: '2026-01-01',
      type: 'link',
      url: 'not a url',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a slideshow entry with an images array', () => {
    const result = fieldNotesSchema.safeParse({
      title: 'X',
      pubDate: '2026-01-01',
      type: 'slideshow',
      images: ['web_assets/a.jpg', 'web_assets/b.jpg'],
    });
    expect(result.success).toBe(true);
  });
});
