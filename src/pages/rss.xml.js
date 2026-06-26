import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  // Get today's date in local timezone YYYY-MM-DD format
  const now = new Date();
  const today = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
  const publishedPosts = posts
    .filter(post => {
      if (post.data.draft) return false;
      // Get post date as string (YYYY-MM-DD)
      let postDateStr;
      if (typeof post.data.pubDate === 'string') {
        postDateStr = post.data.pubDate;
      } else {
        const pd = new Date(post.data.pubDate);
        postDateStr = pd.getFullYear() + '-' + 
          String(pd.getMonth() + 1).padStart(2, '0') + '-' + 
          String(pd.getDate()).padStart(2, '0');
      }
      return postDateStr <= today;
    })
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
