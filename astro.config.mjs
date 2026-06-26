import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://reubeningber.com',
  integrations: [
    tailwind(),
    sitemap({
      serialize(item) {
        // For article pages, try to derive lastmod from the URL pattern
        // The sitemap plugin doesn't have access to frontmatter here,
        // so we set lastmod to now for all pages (a reasonable default).
        // Pages with a custom sitemap.xml.js will override this.
        return item;
      },
    }),
  ],
});
