import { describe, it, expect } from 'vitest';
import { decodeEntities, field, amazonLink } from '../../scripts/lib/rss.mjs';

describe('decodeEntities', () => {
  it('decodes apostrophes and quotes', () => {
    // Regression: Goodreads' <title> tag isn't CDATA-wrapped, so titles like
    // "Trust: America's Best Chance" arrived as literal "&apos;" text.
    expect(decodeEntities("Trust: America&apos;s Best Chance")).toBe("Trust: America's Best Chance");
    expect(decodeEntities('She said &quot;hello&quot;')).toBe('She said "hello"');
  });

  it('decodes numeric entities', () => {
    expect(decodeEntities('&#39;quoted&#39;')).toBe("'quoted'");
    expect(decodeEntities('&#34;quoted&#34;')).toBe('"quoted"');
  });

  it('decodes angle brackets', () => {
    expect(decodeEntities('a &lt;tag&gt; here')).toBe('a <tag> here');
  });

  it('decodes &amp; last so it does not double-unescape other entities', () => {
    expect(decodeEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
    expect(decodeEntities('&amp;apos;')).toBe('&apos;');
  });

  it('leaves plain text untouched', () => {
    expect(decodeEntities('Just a normal title')).toBe('Just a normal title');
  });
});

describe('field', () => {
  it('extracts a plain (non-CDATA) tag and decodes entities', () => {
    const item = '<title>Trust: America&apos;s Best Chance</title>';
    expect(field(item, 'title')).toBe("Trust: America's Best Chance");
  });

  it('extracts a CDATA-wrapped tag', () => {
    const item = '<link><![CDATA[https://example.com/a?b=1&c=2]]></link>';
    expect(field(item, 'link')).toBe('https://example.com/a?b=1&c=2');
  });

  it('returns an empty string when the tag is missing', () => {
    expect(field('<title>Something</title>', 'author_name')).toBe('');
  });

  it('trims surrounding whitespace', () => {
    const item = '<title>\n  Padded Title  \n</title>';
    expect(field(item, 'title')).toBe('Padded Title');
  });
});

describe('amazonLink', () => {
  it('builds a direct product link from a 10-character ISBN', () => {
    expect(amazonLink('198213450X', 'Think Like a Monk', 'Jay Shetty')).toBe(
      'https://www.amazon.com/dp/198213450X'
    );
  });

  it('falls back to a search link when there is no ISBN', () => {
    const url = amazonLink(null, 'Shoe Dog', 'Phil Knight');
    expect(url).toBe('https://www.amazon.com/s?k=Shoe%20Dog%20Phil%20Knight');
  });

  it('falls back to a search link for a 13-digit ISBN (not exactly 10 chars)', () => {
    const url = amazonLink('9781982134500', 'Some Title', 'Some Author');
    expect(url.startsWith('https://www.amazon.com/s?k=')).toBe(true);
  });

  it('strips subtitle and series markers from the search query', () => {
    const url = amazonLink(null, 'Election: A Novel (Tracy Flick, #1)', 'Tom Perrotta');
    expect(url).toBe('https://www.amazon.com/s?k=Election%20Tom%20Perrotta');
  });
});
