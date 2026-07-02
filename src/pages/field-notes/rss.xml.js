import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { isPublished } from '../../utils/publish';

export async function GET(context) {
  const entries = (await getCollection('field-notes'))
    .filter(e => isPublished(e.data.pubDate, e.data.draft))
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
