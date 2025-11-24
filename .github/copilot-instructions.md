# Copilot Instructions for Reuben's Personal Site

## Architecture Overview
**Astro v5 static site** with type-safe content collections for blog posts and photo albums. Deployed to GitHub Pages with custom domain (`reubeningber.com`).

**Stack:**
- **Astro v5.14.7** - Static site generator with content collections
- **Tailwind CSS v3.4.9** - Utility-first styling with orange accent (`#ea580c`)
- **Cloudinary** - Responsive image delivery (no local image storage)
- **PhotoSwipe v5.4.4** - Lightbox galleries with lazy loading
- **Zod** - Runtime validation for content schemas

## Content Collections System

### Blog Posts (`src/content/posts/`)
Markdown files with frontmatter validated by Zod schema in `src/content/config.ts`:
```yaml
title: "Post Title"
subTitle: "Optional subtitle"
pubDate: "2025-11-23"
draft: false
category: "Fatherhood"  # or Engineering, Books, Life, Other
image: "web_assets/filename.jpg"  # Cloudinary path OR full URL
imageCredit: "Photographer Name"
imageCreditUrl: "https://..."
```

**Image handling logic** (see `PostLayout.astro` lines 8-56):
- `web_assets/` prefix → Cloudinary with responsive srcset
- Full Cloudinary URL → Extract path, apply transformations
- `/assets/images/` → Local fallback (legacy)
- External URLs → Plain lazy load

### Photo Albums (`src/content/albums/`)
JSON manifests with Cloudinary `publicId` references:
```json
{
  "title": "Album Name",
  "slug": "url-friendly-slug",
  "pubDate": "2025-10-10",
  "coverPublicId": "folder/image-name",
  "items": [
    {"publicId": "folder/image-01", "caption": "Optional"}
  ]
}
```

Albums **randomize photo order** on each page load using Fisher-Yates shuffle (see `[album].astro` lines 18-26).

## Critical Workflows

### Creating New Blog Posts
**Always use the interactive script:**
```bash
./scripts/new-post.sh
```
This generates properly formatted frontmatter with:
- Auto-slugified filename (`YYYY-MM-DD-title.md`)
- Date defaulting to today
- Optional image/credit fields
- Category validation

### Creating Photo Albums
**Use the prepare script for batch uploads:**
```bash
./scripts/prepare-photos.sh /path/to/photos
```
This script:
1. Resizes images to max 4000px width with 85% quality (ImageMagick required)
2. Generates album JSON manifest interactively
3. Creates `cloudinary-ready/` output folder
4. Sorts files alphabetically before processing

**Manual process:**
1. Upload to Cloudinary folder (e.g., `paris-october-2025/`)
2. Create JSON in `src/content/albums/` with matching `publicId` paths
3. Set unique `slug` for URL generation

### Cloudinary URL Pattern
Helper function `buildUrl(publicId, width)` generates:
```
https://res.cloudinary.com/${cloud}/image/upload/f_auto,w_${width}/${publicId}.jpg
```
- `f_auto` = automatic format (WebP/AVIF)
- `w_${width}` = responsive width (600/800/1200/2400)
- `v1761245976` = version timestamp (cache busting)

## Routing & Dynamic Paths

### Blog Routes
- `/articles/` - Post listing (chronological)
- `/articles/[...slug]` - Individual posts (supports nested slugs)
- `/articles/category/[category]` - Category-filtered listings

All use `getStaticPaths()` with `getCollection('posts')` to generate routes at build time.

### Photo Routes
- `/photos/` - Album grid
- `/photos/[album]` - Individual galleries with PhotoSwipe lightbox
- `/photos/highlights` - Curated selection

PhotoSwipe dynamically calculates dimensions from thumbnail aspect ratio (see `[album].astro` lines 55-66).

## Styling Conventions

### Tailwind Config (`tailwind.config.cjs`)
```javascript
colors: {
  accent: '#ea580c',    // Primary orange (links, tags)
  primary: '#1f2937',   // Dark gray (headings)
  secondary: '#6b7280'  // Mid gray (body text)
}
```

**Common patterns:**
- Category tags: `bg-accent text-white px-2 py-1 rounded text-xs`
- Hover states: `hover:opacity-90 transition-opacity`
- Photo grids: `columns-2 sm:columns-3` (masonry layout)

## Deployment (GitHub Pages)

### Automated Workflow (`.github/workflows/deploy.yml`)
Triggers on push to `main` branch:
1. `npm ci` - Clean install
2. `npm run build` with `PUBLIC_CLOUDINARY_CLOUD_NAME` secret
3. Deploy `./dist` to GitHub Pages

**Critical:** `public/CNAME` file must contain `reubeningber.com` to persist custom domain.

### Environment Variables
- **Local dev:** `.env` with `PUBLIC_CLOUDINARY_CLOUD_NAME`
- **Production:** GitHub Secrets → `PUBLIC_CLOUDINARY_CLOUD_NAME`

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/content/config.ts` | Zod schemas for posts/albums |
| `src/layouts/PostLayout.astro` | Smart image handling + OG image generation |
| `src/pages/photos/[album].astro` | PhotoSwipe implementation + randomization |
| `tailwind.config.cjs` | Orange accent theme (`#ea580c`) |
| `scripts/new-post.sh` | Interactive post creation |
| `scripts/prepare-photos.sh` | Batch photo resizing + JSON generation |

## Common Tasks

**Filter draft posts:**
```javascript
const posts = await getCollection('posts', ({ data }) => !data.draft);
```

**Generate OG images:**
Posts use smart fallback (see `PostLayout.astro` lines 58-77):
1. Post image → Cloudinary w/ crop (1200x630)
2. No image → Default headshot

**Add new category:**
Update validation in `src/content/config.ts` schema, then use in frontmatter.
