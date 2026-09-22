import { isPublished } from '../utils/publish';
import { slugifyCategory } from '../utils/content';

// The single source of truth for the sitemap. @astrojs/sitemap was removed
// because it listed every built route, including draft posts.
export async function GET() {
  const { getCollection } = await import('astro:content');

  const posts = await getCollection('posts');
  const publishedPosts = posts.filter(p => isPublished(p.data.pubDate, p.data.draft));

  const fieldNotes = await getCollection('field-notes');
  const publishedNotes = fieldNotes
    .filter(e => isPublished(e.data.pubDate, e.data.draft))
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const categories = [...new Set(publishedPosts.map(p => p.data.category).filter(Boolean))];
  const fieldNotePages = Math.ceil(publishedNotes.length / 10);

  const baseUrl = 'https://reubeningber.com';
  const toDate = (date) => date.toISOString().split('T')[0];

  const staticPages = [
    '/',
    '/start-here/',
    '/articles/',
    '/contact/',
    '/friends/',
    '/now/',
    '/reading/',
    '/uses/',
    '/colophon/',
    '/changelog/',
    '/identity-statement/',
  ];

  const url = (loc, { lastmod, changefreq, priority }) => `
  <url>
    <loc>${baseUrl}${loc}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => url(page, {
    changefreq: 'weekly',
    priority: page === '/' ? '1.0' : '0.8',
  })).join('')}
  ${url('/field-notes/', {
    lastmod: publishedNotes.length > 0 ? toDate(publishedNotes[0].data.pubDate) : undefined,
    changefreq: 'weekly',
    priority: '0.8',
  })}
  ${Array.from({ length: Math.max(fieldNotePages - 1, 0) }, (_, i) => url(`/field-notes/${i + 2}/`, {
    changefreq: 'weekly',
    priority: '0.4',
  })).join('')}
  ${categories.map(cat => url(`/articles/category/${slugifyCategory(cat)}/`, {
    changefreq: 'weekly',
    priority: '0.6',
  })).join('')}
  ${publishedPosts.map(post => url(`/articles/${post.slug}/`, {
    lastmod: toDate(post.data.updatedDate || post.data.pubDate),
    changefreq: 'monthly',
    priority: '0.7',
  })).join('')}
  ${publishedNotes.map(note => url(`/field-notes/${note.slug}/`, {
    lastmod: toDate(note.data.pubDate),
    changefreq: 'yearly',
    priority: '0.5',
  })).join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
