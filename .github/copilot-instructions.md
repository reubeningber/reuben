# Copilot Instructions for Reuben's Personal Site

## Architecture Overview
This is an **Astro static site** with content collections for blog posts and photo albums. The site uses:
- **Tailwind CSS** for styling with custom orange accent (`#ea580c`)
- **Cloudinary** for responsive image delivery and optimization
- **PhotoSwipe** for lightbox photo galleries
- **Content collections** defined in `src/content/config.ts` for type-safe content management

## Content Management System
- **Blog posts**: Markdown files in `src/content/posts/` with frontmatter (title, description, pubDate, draft)
- **Photo albums**: JSON manifests in `src/content/albums/` containing Cloudinary `publicId` references
- All content is type-validated using Zod schemas in `src/content/config.ts`

## Key Patterns & Conventions

### Cloudinary Integration
- Photos are referenced by `publicId` (e.g., `"reuben/sample/01"`) in album JSON files
- The `buildUrl()` helper function creates responsive Cloudinary URLs: `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${width}/${publicId}.jpg`
- Environment variable `PUBLIC_CLOUDINARY_CLOUD_NAME` must be set in `.env`

### Routing Structure
- Blog posts: `/articles/[...slug]` dynamic route handles nested slugs
- Photo albums: `/photos/[album]` where `[album]` matches the `slug` field in album JSON
- RSS feed: Generated at `/rss.xml` from blog posts collection

### Component Architecture
- `BaseLayout.astro`: Main layout with SEO meta tags, includes Header/Footer
- `PostLayout.astro`: Extends BaseLayout for blog posts
- `PhotoGrid.astro`: Reusable grid component for displaying Cloudinary images
- `Plausible.astro`: Analytics component (check if configured)

## Development Workflow
```bash
npm run dev      # Start dev server
npm run build    # Build for production  
npm run preview  # Preview production build
```

## Critical Files to Understand
- `src/content/config.ts`: Content collection schemas and validation
- `src/pages/photos/[album].astro`: Photo gallery implementation with PhotoSwipe
- `astro.config.mjs`: Site URL configuration (update for custom domain)
- `tailwind.config.cjs`: Custom styling with orange accent theme

## Adding Content
- **New blog post**: Create `.md` file in `src/content/posts/` with required frontmatter
- **New photo album**: 
  1. Upload photos to Cloudinary folder (e.g., `reuben/album-name/`)
  2. Create JSON manifest in `src/content/albums/` with `publicId` references
  3. Set unique `slug` field for URL generation

## Environment Setup
Copy `.env.example` to `.env` and set `PUBLIC_CLOUDINARY_CLOUD_NAME` to your Cloudinary cloud name for photo functionality.