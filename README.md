# Reuben's Personal Site

A modern static site built with Astro, Tailwind CSS, and Cloudinary. Features a blog with category filtering, short-form field notes, and a clean, responsive design with an orange accent theme. Photo galleries live on a separate site, [photos.reubeningber.com](https://photos.reubeningber.com), linked from the nav.

## Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Set up environment
cp .env.example .env
# Edit .env: set PUBLIC_CLOUDINARY_CLOUD_NAME to your Cloudinary cloud name

# 3) Run locally
npm run dev

# 4) Build for production
npm run build
npm run preview
```

## Tech Stack

- **Astro v5** - Static site framework with content collections
- **Tailwind CSS v3** - Utility-first styling with custom orange accent (#ea580c)
- **Cloudinary** - Responsive image delivery and optimization
- **Zod** - Type-safe content validation

## Site Structure

```
src/
├── pages/              # Routes
│   ├── index.astro                 # Homepage
│   ├── start-here.astro            # About page
│   ├── contact.astro               # Contact page
│   ├── now.astro                   # Now page
│   ├── uses.astro                  # Uses page
│   ├── friends.astro               # Friends page
│   ├── reading.astro               # Reading page (tabbed year-by-year book log, 2020-2026; search + audio filter)
│   ├── colophon.astro              # Colophon page
│   ├── identity-statement.astro    # Identity statement page
│   ├── rss.xml.js                  # RSS feed
│   ├── sitemap.xml.js              # Sitemap
│   ├── articles/                   # Blog routes
│   │   ├── index.astro             # Blog listing
│   │   ├── [...slug].astro         # Individual posts
│   │   └── category/               # Category filtering
│   └── field-notes/                # Short-form entries
│       ├── [...page].astro         # Paginated listing
│       ├── [slug].astro            # Individual entry
│       └── rss.xml.js              # Field notes RSS feed
├── components/          # Reusable UI components
│   ├── Header.astro             # Site header with navigation
│   ├── Footer.astro             # Site footer with social links
│   ├── PostList.astro           # Blog post grid
│   ├── Breadcrumbs.astro        # Breadcrumb nav
│   ├── FieldNoteSlideshow.astro   # Interactive image slideshow for field notes
│   └── CloudflareAnalytics.astro  # Cloudflare Web Analytics beacon
├── layouts/             # Page layouts
│   ├── BaseLayout.astro         # Base layout with SEO, analytics
│   └── PostLayout.astro         # Blog post layout
├── content/             # Content collections
│   ├── config.ts                # Zod schemas
│   ├── posts/                   # Blog posts (Markdown)
│   └── field-notes/             # Field notes (Markdown)
└── styles/              # Global styles
    └── global.css
```

Photo galleries are not part of this codebase — they live on a separate site at [photos.reubeningber.com](https://photos.reubeningber.com), linked externally from `Header.astro`.

## Features

### Blog System
- **Markdown-based posts** with frontmatter validation
- **Category system** with filtering pages
- **Orange accent tags** for visual hierarchy
- **RSS feed** at `/rss.xml`
- **SEO optimized** with meta tags and Open Graph

### Field Notes
- **Short-form entries** — links, images, embeds, or slideshows, with optional commentary
- **Slideshows** — a set of images with prev/next, dots, swipe, and keyboard navigation (`type: slideshow`, `images: [...]`)
- **Paginated listing** at `/field-notes/`
- **RSS feed** at `/field-notes/rss.xml`

### Design
- **Responsive layout** optimized for mobile and desktop
- **Custom orange accent** (#ea580c) throughout
- **Clean typography** with proper spacing
- **Accessible navigation** with semantic HTML

## Content Management

### Pages CMS

Posts can be edited through Pages CMS without changing the Astro build or GitHub Pages deployment.

1. Open the online editor for this repository in Pages CMS
2. Sign in with GitHub
3. Pages CMS will load the repo configuration from `.pages.yml`
4. Edit entries in `Posts`, then commit the changes back to the repo

The Astro site continues to read Markdown from `src/content/posts/`, so Pages CMS is only an editing layer on top of the existing files.

### Creating Blog Posts

**Option 1: Use the helper script (recommended)**

```bash
./scripts/new-post.sh
```

The script will prompt you for:
- Post title
- Publication date (defaults to today)
- Image path (optional)
- Image credit (optional, only if image provided)
- Image credit URL (optional, only if image credit provided)
- Category

It automatically creates a properly formatted Markdown file in `src/content/posts/`.

**Option 2: Manual creation**

Create a file in `src/content/posts/` with the format: `YYYY-MM-DD-slug.md`

```markdown
---
title: "Your Post Title"
pubDate: "2025-10-22"
image: "/assets/images/photo.jpg"
imageCredit: "Unsplash"
imageCreditUrl: "https://unsplash.com/photos/example"
category: "Fatherhood"
---

Your post content here...
```

**Available categories:** Books, Code, Engineering Management, Favorites, Fatherhood, Journaling, Life, Mental Health, Photography, or create your own.

**Optional frontmatter fields:**
- `image` - Path or URL to post header image
- `imageCredit` - Credit text for the image (e.g., "Unsplash", "John Doe")
- `imageCreditUrl` - URL to link the image credit to (e.g., photographer's page)
- `category` - Post category for filtering and organization

## Helper Scripts

### `scripts/new-post.sh`

Creates a new blog post with interactive prompts.

**Usage:**
```bash
./scripts/new-post.sh
```

**Features:**
- Prompts for title, date, image, image credit, and category
- Generates URL-friendly slug from title
- Creates formatted Markdown file with all frontmatter fields
- Includes starter content template
- Validates date format
- Checks for existing files
- Conditional prompts (only asks for image credit if image provided)

### `scripts/update-reading.mjs`

Diffs Reuben's Goodreads "read" shelf against `src/data/reading/{year}.json`, uploads covers for any new books to Cloudinary (`reading_covers/{goodreads_book_id}`), and writes the updated year files. Runs weekly via `.github/workflows/update-reading.yml`, which opens a PR when there's anything new. Requires `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` (repo secrets in CI, or in local `.env` to run manually):
```bash
node scripts/update-reading.mjs
```

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Find your "Cloud Name" in the dashboard
3. Add it to `.env`:
   ```
   PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```
4. Upload images to a folder (e.g. `web_assets/`) and reference the path in post frontmatter

**Image URL format:**
```
https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto,w_{width}/{publicId}.jpg
```

The site automatically generates responsive URLs with optimal formats (WebP, AVIF) and quality.

## Analytics

Two analytics tools run in parallel via `BaseLayout.astro`:

- **Google Analytics (GA4)** — hardcoded tag `G-8DBW26ND7K`, always active in production
- **Cloudflare Web Analytics** — privacy-first, hardcoded beacon token in `CloudflareAnalytics.astro`, always active in production

## Deployment

### GitHub Pages with Custom Domain

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup instructions.**

Quick steps:
1. Update `astro.config.mjs` with your domain
2. Add `PUBLIC_CLOUDINARY_CLOUD_NAME` to GitHub Secrets
3. Enable GitHub Pages (Source: GitHub Actions)
4. Configure DNS records at your domain provider
5. Create `public/CNAME` file with your domain
6. Push to `main` branch

The included workflow (`.github/workflows/deploy.yml`) automatically builds and deploys on every push to `main`.

### Manual Build

```bash
npm run build
# Output: dist/ folder ready to deploy anywhere
```

## Customization

### Colors

Edit `tailwind.config.cjs` to change the accent color:

```js
colors: {
  accent: '#ea580c', // Orange accent
}
```

### Navigation

Update navigation items in:
- `src/components/Header.astro` (main nav)
- `src/components/Footer.astro` (footer nav)

### Social Links

Edit the social links in:
- `src/components/Footer.astro` (footer icons)
- `src/pages/start-here.astro` (about page)
- `src/pages/contact.astro` (contact page)

### Site Metadata

Update `src/layouts/BaseLayout.astro` for default SEO values.

### Favicons

The site includes a simple SVG favicon (`public/favicon.svg`) with an orange "R" that matches the site's accent color.

**To customize your favicon:**

1. **Option 1: Use the SVG** (simplest)
   - Edit `public/favicon.svg` to change the letter or design
   - Modern browsers will use this automatically

2. **Option 2: Generate PNG versions** (better compatibility)
   - Create your favicon design (recommended: 512x512px)
   - Generate multiple sizes using a tool like:
     - [RealFaviconGenerator](https://realfavicongenerator.net/)
     - [Favicon.io](https://favicon.io/)
   - Replace files in `public/`:
     - `favicon.ico` (16x16, 32x32)
     - `favicon-16x16.png`
     - `favicon-32x32.png`
     - `apple-touch-icon.png` (180x180)

The layout includes proper favicon links for all major browsers and devices.

## Development

```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Build for production
npm run preview      # Preview production build
npm run astro        # Run Astro CLI commands
```

## Testing

The site has a unit test suite (Vitest) covering pure logic like Cloudinary URL building and publish-date filtering, and an end-to-end smoke test suite (Playwright) covering the homepage, articles, field notes, RSS, and sitemap.

```bash
npm run test          # Run unit tests once
npm run test:watch    # Run unit tests in watch mode
npm run test:e2e      # Build the site and run Playwright smoke tests against it
npm run test:all      # Run unit tests, then e2e tests
```

Before running e2e tests for the first time, install the Playwright browser:

```bash
npx playwright install --with-deps chromium
```

Unit tests live in `tests/unit/`, e2e tests in `tests/e2e/`. Both suites run automatically on push/PR via `.github/workflows/test.yml`.

## License

Personal project - feel free to use as inspiration for your own site!
