import { describe, it, expect } from 'vitest';
import { decodeEntities, parseShelfWidget, parseRatedDates, amazonLink } from '../../scripts/lib/goodreads.mjs';

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

describe('parseShelfWidget', () => {
  // Abridged from a real /review/custom_widget response: HTML in a JS string.
  const widget = (bookHtml: string) =>
    `var widget_code = '  <div class=\\"gr_custom_container_abc\\">\\n${bookHtml}<\\/div>';\n` +
    `var widget_div = document.getElementById('gr_custom_widget_abc');`;
  const star = (state: string) => `<img src=\\"https://s.gr-assets.com/images/layout/gr_flat_red_star_${state}.png\\" />`;
  const book = (title: string, img: string, tags = 'read') =>
    `<div class=\\"gr_custom_each_container_abc\\">\\n` +
    `<a title=\\"${title}\\" rel=\\"nofollow\\" href=\\"https://www.goodreads.com/review/show/1\\"><img alt=\\"${title}\\" border=\\"0\\" src=\\"${img}\\" /><\\/a>` +
    `<div class=\\"gr_custom_rating_abc\\">${star('active')}${star('active')}${star('inactive')}<\\/div>` +
    `<div class=\\"gr_custom_author_abc\\">\\n by <a rel=\\"nofollow\\" href=\\"https://www.goodreads.com/author/show/1.X\\">Lisa  Rogak<\\/a>\\n<\\/div>` +
    `<div class=\\"gr_custom_tags_abc\\">\\n tagged:\\n ${tags}\\n <\\/div>` +
    `<\\/div>`;

  it('extracts each book, with its id from the cover filename and a full-size cover', () => {
    const img = 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1328335870l/8482788._SY75_.jpg';
    expect(parseShelfWidget(widget(book('A Boy Named Shel', img)))).toEqual([
      {
        title: 'A Boy Named Shel',
        author: 'Lisa Rogak',
        img: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1328335870l/8482788.jpg',
        bookId: '8482788',
        rating: 2,
        audio: false,
      },
    ]);
  });

  it('decodes entities and JS-escaped apostrophes in titles', () => {
    const [b] = parseShelfWidget(widget(book("Tom &amp; Jerry\\'s", 'https://x/books/1l/5._SX50_.jpg')));
    expect(b.title).toBe("Tom & Jerry's");
  });

  it('flags audiobooks from their tags, matching whole tags only', () => {
    const img = 'https://x/books/1l/5._SX50_.jpg';
    expect(parseShelfWidget(widget(book('A', img, 'audio')))[0].audio).toBe(true);
    expect(parseShelfWidget(widget(book('A', img, 'currently-reading and audio')))[0].audio).toBe(true);
    expect(parseShelfWidget(widget(book('A', img, 'read, favorites, and audio')))[0].audio).toBe(true);
    expect(parseShelfWidget(widget(book('B', img, 'audio-maybe')))[0].audio).toBe(false);
  });

  it('leaves bookId null for a book with a placeholder cover', () => {
    const [b] = parseShelfWidget(widget(book('No Cover', 'https://s.gr-assets.com/assets/nophoto/book/50x75-a91bf249278a81aabab721ef782c4a74.png')));
    expect(b.bookId).toBeNull();
  });

  it('returns an empty list for an empty shelf', () => {
    expect(parseShelfWidget(widget(''))).toEqual([]);
  });

  it('throws on a response that is not the widget, rather than reporting an empty shelf', () => {
    expect(() => parseShelfWidget('<html>Page not found</html>')).toThrow();
  });
});

describe('parseRatedDates', () => {
  const now = new Date('2026-11-03T13:00:00Z').getTime();
  const update = (date: string | null, action: string, id: string) =>
    `<div class="update "  >${date ? `<p>${date}</p>` : ''}` +
    `<a class="updateImage" href="/book/show/${id}-slug"></a><div class="updateAction">${action}</div></div>`;

  it('maps rated books to their date and ignores other kinds of update', () => {
    const html = update('November 03', 'is currently reading', '1') + update('October 26', 'rated a book', '2');
    expect(parseRatedDates(html, now)).toEqual(new Map([['2', '2026-10-26']]));
  });

  it('carries a date forward to later updates from the same day', () => {
    const html = update('October 26', 'rated a book', '2') + update(null, 'rated a book', '3');
    expect(parseRatedDates(html, now).get('3')).toBe('2026-10-26');
  });

  it('moves a yearless date that would be in the future back a year', () => {
    expect(parseRatedDates(update('December 20', 'rated a book', '4'), now).get('4')).toBe('2025-12-20');
  });

  it('uses an explicit year when there is one', () => {
    expect(parseRatedDates(update('March 02, 2024', 'rated a book', '5'), now).get('5')).toBe('2024-03-02');
  });

  it('keeps the most recent rating when a book was rated twice', () => {
    const html = update('October 26', 'rated a book', '6') + update('October 01', 'rated a book', '6');
    expect(parseRatedDates(html, now).get('6')).toBe('2026-10-26');
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
