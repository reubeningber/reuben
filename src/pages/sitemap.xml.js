export async function GET() {
  const { getCollection } = await import('astro:content');
  const posts = await getCollection('posts');
  const publishedPosts = posts.filter(post => !post.data.draft);

  const baseUrl = 'https://reubeningber.com';

  const staticPages = [
    '',
    '/start-here/',
    '/articles/',
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
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
