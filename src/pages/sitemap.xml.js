import { getCollection } from 'astro:content';

export async function GET() {
  // Get all posts and albums
  const posts = await getCollection('posts');
  const publishedPosts = posts.filter(post => !post.data.draft);
  const albums = await getCollection('albums');

  // Base URL from site config
  const baseUrl = 'https://reubeningber.com';

  // Static pages
  const staticPages = [
    '',           // Homepage
    '/start-here/',
    '/articles/',
    '/photos/',
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
  ${albums.map(album => `
  <url>
    <loc>${baseUrl}/photos/${album.data.slug}/</loc>
    <lastmod>${album.data.pubDate ? new Date(album.data.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`.trim();

  // Return the sitemap with proper headers
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}