import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const now = new Date();
  const today = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  const entries = (await getCollection('field-notes'))
    .filter(e => {
      if (e.data.draft) return false;
      const dateStr = e.data.pubDate instanceof Date
        ? e.data.pubDate.toISOString().split('T')[0]
        : String(e.data.pubDate);
      return dateStr <= today;
    })
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  return rss({
    title: 'Reuben Ingber — Field Notes',
    description: 'Links, images, and things worth sharing.',
    site: context.site,
    items: entries.map(e => ({
      title: e.data.title,
      pubDate: e.data.pubDate,
      description: e.body?.trim() || e.data.title,
      link: e.data.type === 'link' && e.data.url ? e.data.url : '/field-notes/',
    })),
  });
}
