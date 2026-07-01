export async function GET() {
  const { getCollection } = await import('astro:content');
  const now = new Date();
  const today = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  function isPublished(pubDate) {
    const dateStr = pubDate instanceof Date
      ? pubDate.toISOString().split('T')[0]
      : String(pubDate);
    return dateStr <= today;
  }

  const posts = await getCollection('posts');
  const publishedPosts = posts.filter(p => !p.data.draft && isPublished(p.data.pubDate));

  const fieldNotes = await getCollection('field-notes');
  const publishedNotes = fieldNotes.filter(e => !e.data.draft && isPublished(e.data.pubDate));

  const baseUrl = 'https://reubeningber.com';

  const staticPages = [
    '',
    '/start-here/',
    '/articles/',
    '/field-notes/',
    '/contact/',
  ];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${publishedPosts.map(post => `
  <url>
    <loc>${baseUrl}/articles/${post.slug}/</loc>
    <lastmod>${post.data.pubDate.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${publishedNotes.length > 0 ? `
  <url>
    <loc>${baseUrl}/field-notes/</loc>
    <lastmod>${publishedNotes[0].data.pubDate.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>` : ''}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
