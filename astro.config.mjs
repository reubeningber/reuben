import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Update 'site' to your custom domain once you have it.
export default defineConfig({
  site: 'https://example.com',
  integrations: [tailwind(), sitemap()],
});
