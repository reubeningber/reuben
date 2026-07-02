import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { isPublished } from '../utils/publish';

export async function GET(context) {
  const posts = await getCollection('posts');
  const publishedPosts = posts
    .filter(post => isPublished(post.data.pubDate, post.data.draft))
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
    
  return rss({
    title: 'Reuben Ingber',
    description: 'Articles on fatherhood, engineering management, ADHD, books, and life by Reuben Ingber.',
    site: context.site,
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/articles/${post.slug}/`
    }))
  });
}
