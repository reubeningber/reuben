import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Reads real content-collection files at test time rather than hardcoding
// post/note titles, so these tests keep working as content changes.

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');
const NOTES_DIR = path.join(process.cwd(), 'src/content/field-notes');

function frontmatter(filePath: string): string {
  const raw = readFileSync(filePath, 'utf-8');
  return raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
}

function isDraft(fm: string): boolean {
  return /^draft:\s*true\s*$/m.test(fm);
}

// Deliberately not a regex-per-value-shape parser: frontmatter values here
// are either unquoted (may contain apostrophes, e.g. "Don't") or wrapped in
// matching quotes, plus _template.md has one inline "# comment" trailer.
function field(fm: string, key: string): string | null {
  const line = fm.split('\n').find((l) => l.startsWith(`${key}:`));
  if (!line) return null;
  let value = line.slice(key.length + 1).trim().replace(/\s+#.*$/, '');
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value || null;
}

function slugOf(file: string): string {
  return file.replace(/\.md$/, '');
}

function isFuture(pubDate: string | null): boolean {
  if (!pubDate) return false;
  return new Date(pubDate) > new Date();
}

// The rss() helper XML-escapes item titles, so a raw frontmatter title like
// "Why Some Dad Don't have friends" appears in the feed as "...Don&apos;t...".
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Finds the single <item>...</item> block containing an exact <title>, so a
// title match can't accidentally span into a neighboring item.
function findRssItem(xml: string, title: string): string | undefined {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const escaped = xmlEscape(title);
  return items.find((item) => item.includes(`<title>${escaped}</title>`));
}

test.describe('sitemap.xml', () => {
  test('excludes draft and future-dated posts', async ({ request }) => {
    const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
    const excludedSlugs = files
      .filter((f) => {
        const fm = frontmatter(path.join(POSTS_DIR, f));
        return isDraft(fm) || isFuture(field(fm, 'pubDate'));
      })
      .map(slugOf);
    expect(excludedSlugs.length).toBeGreaterThan(0); // sanity: repo has at least one draft to check against

    const res = await request.get('/sitemap.xml');
    const xml = await res.text();
    for (const slug of excludedSlugs) {
      expect(xml).not.toContain(`/articles/${slug}/`);
    }
  });

  test('lists every static page', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    const xml = await res.text();
    const staticPages = [
      '', '/start-here/', '/articles/', '/field-notes/', '/contact/',
      '/friends/', '/now/', '/reading/', '/uses/', '/colophon/', '/changelog/',
    ];
    for (const page of staticPages) {
      expect(xml).toContain(`<loc>https://reubeningber.com${page}</loc>`);
    }
  });

  test('includes at least one published article', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    const xml = await res.text();
    expect(xml).toMatch(/<loc>https:\/\/reubeningber\.com\/articles\/[^<]+\/<\/loc>/);
  });
});

test.describe('rss.xml', () => {
  test('excludes draft and future-dated posts', async ({ request }) => {
    const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
    const draftTitles = files
      .filter((f) => isDraft(frontmatter(path.join(POSTS_DIR, f))))
      .map((f) => field(frontmatter(path.join(POSTS_DIR, f)), 'title'))
      .filter((t): t is string => Boolean(t));
    expect(draftTitles.length).toBeGreaterThan(0);

    const res = await request.get('/rss.xml');
    const xml = await res.text();
    for (const title of draftTitles) {
      expect(xml).not.toContain(`<title>${xmlEscape(title)}</title>`);
    }
  });

  test('orders items newest-first by pubDate', async ({ request }) => {
    const res = await request.get('/rss.xml');
    const xml = await res.text();
    const dates = [...xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) => new Date(m[1]).getTime());
    expect(dates.length).toBeGreaterThan(1);
    const sorted = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sorted);
  });
});

test.describe('field-notes/rss.xml', () => {
  test('a link-type note\'s <link> points at its external url, not /field-notes/', async ({ request }) => {
    const files = readdirSync(NOTES_DIR).filter((f) => f.endsWith('.md') && f !== '_template.md');
    const linkNote = files
      .map((f) => ({ file: f, fm: frontmatter(path.join(NOTES_DIR, f)) }))
      .find(({ fm }) => field(fm, 'type') === 'link' && !isDraft(fm) && field(fm, 'url'));
    expect(linkNote).toBeTruthy();

    const title = field(linkNote!.fm, 'title')!;
    const url = field(linkNote!.fm, 'url')!;

    const res = await request.get('/field-notes/rss.xml');
    const xml = await res.text();
    const item = findRssItem(xml, title);
    expect(item).toBeTruthy();
    expect(item).toContain(`<link>${xmlEscape(url)}</link>`);
  });

  test('a non-link-type note\'s <link> points at /field-notes/', async ({ request }) => {
    const files = readdirSync(NOTES_DIR).filter((f) => f.endsWith('.md') && f !== '_template.md');
    const nonLinkNote = files
      .map((f) => ({ file: f, fm: frontmatter(path.join(NOTES_DIR, f)) }))
      .find(({ fm }) => field(fm, 'type') !== 'link' && !isDraft(fm));
    expect(nonLinkNote).toBeTruthy();

    const title = field(nonLinkNote!.fm, 'title')!;

    const res = await request.get('/field-notes/rss.xml');
    const xml = await res.text();
    const item = findRssItem(xml, title);
    expect(item).toBeTruthy();
    expect(item).toContain('<link>https://reubeningber.com/field-notes/</link>');
  });

  test('excludes the draft template note', async ({ request }) => {
    const fm = frontmatter(path.join(NOTES_DIR, '_template.md'));
    expect(isDraft(fm)).toBe(true); // sanity: the fixture we're relying on is still a draft
    const title = field(fm, 'title')!;

    const res = await request.get('/field-notes/rss.xml');
    const xml = await res.text();
    expect(xml).not.toContain(`<title>${xmlEscape(title)}</title>`);
  });
});
