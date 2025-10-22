# Reuben's Personal Site

A modern static site built with Astro, Tailwind CSS, and Cloudinary. Features a blog with category filtering, photo galleries with lightbox viewing, and a clean, responsive design with an orange accent theme.

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

- **Astro v4.12.0** - Static site framework with content collections
- **Tailwind CSS v3.4.9** - Utility-first styling with custom orange accent (#ea580c)
- **Cloudinary** - Responsive image delivery and optimization
- **PhotoSwipe v5.4.4** - Lightbox gallery for photo albums
- **Zod** - Type-safe content validation

## Site Structure

```
src/
├── pages/              # Routes
│   ├── index.astro           # Homepage
│   ├── start-here.astro      # About page
│   ├── contact.astro         # Contact page
│   ├── articles/             # Blog routes
│   │   ├── index.astro       # Blog listing
│   │   ├── [...slug].astro   # Individual posts
│   │   └── category/         # Category filtering
│   └── photos/               # Photo galleries
│       ├── index.astro       # Album listing
│       └── [album].astro     # Individual albums
├── components/         # Reusable UI components
│   ├── Header.astro          # Site header with navigation
│   ├── Footer.astro          # Site footer with social links
│   ├── PostList.astro        # Blog post grid
│   └── PhotoGrid.astro       # Photo gallery grid
├── layouts/            # Page layouts
│   ├── BaseLayout.astro      # Base layout with SEO
│   └── PostLayout.astro      # Blog post layout
├── content/            # Content collections
│   ├── config.ts             # Zod schemas
│   ├── posts/                # Blog posts (Markdown)
│   └── albums/               # Photo albums (JSON)
└── styles/             # Global styles
    └── global.css
```

## Features

### Blog System
- **Markdown-based posts** with frontmatter validation
- **Category system** with filtering pages
- **Orange accent tags** for visual hierarchy
- **RSS feed** at `/rss.xml`
- **SEO optimized** with meta tags and Open Graph

### Photo Galleries
- **Cloudinary integration** for responsive images
- **PhotoSwipe lightbox** for full-screen viewing
- **Lazy loading** for performance
- **Album manifests** with JSON metadata

### Design
- **Responsive layout** optimized for mobile and desktop
- **Custom orange accent** (#ea580c) throughout
- **Clean typography** with proper spacing
- **Accessible navigation** with semantic HTML

## Content Management

### Creating Blog Posts

**Option 1: Use the helper script (recommended)**

```bash
./scripts/new-post.sh
```

The script will prompt you for:
- Post title
- Publication date (defaults to today)
- Image path (optional)
- Category

It automatically creates a properly formatted Markdown file in `src/content/posts/`.

**Option 2: Manual creation**

Create a file in `src/content/posts/` with the format: `YYYY-MM-DD-slug.md`

```markdown
---
title: "Your Post Title"
pubDate: "2025-10-22"
image: "/assets/images/photo.jpg"
category: "Fatherhood"
---

Your post content here...
```

**Available categories:** Fatherhood, Engineering, Books, or create your own.

### Creating Photo Albums

**Use the helper script:**

```bash
./scripts/prepare-photos.sh [input-dir] [output-dir]
```

The script will:
1. Ask for album metadata (title, slug, description, date, Cloudinary folder)
2. Resize and optimize images (max 4000px, 85% quality)
3. Generate a JSON manifest with Cloudinary public IDs
4. Create optimized images ready for upload

**Next steps after running the script:**
1. Review the optimized images in the output directory
2. Upload images to Cloudinary (keep the original filenames)
3. Copy the generated `.json` file to `src/content/albums/`
4. Your album will be live at `/photos/[album-slug]/`

**Manual album creation:**

Create a JSON file in `src/content/albums/`:

```json
{
  "title": "Album Title",
  "slug": "album-slug",
  "description": "Album description",
  "pubDate": "2025-10-22",
  "coverPublicId": "reuben/folder/cover-image",
  "items": [
    {
      "publicId": "reuben/folder/photo-01",
      "caption": "Photo caption"
    }
  ]
}
```

## Helper Scripts

### `scripts/new-post.sh`

Creates a new blog post with interactive prompts.

**Usage:**
```bash
./scripts/new-post.sh
```

**Features:**
- Prompts for title, date, image, and category
- Generates URL-friendly slug from title
- Creates formatted Markdown file
- Includes starter content template
- Validates date format
- Checks for existing files

### `scripts/prepare-photos.sh`

Prepares photos for Cloudinary and creates album manifest.

**Usage:**
```bash
./scripts/prepare-photos.sh [input-dir] [output-dir]
```

**Features:**
- Resizes images to max 4000px width
- Compresses to 85% quality
- Strips EXIF data
- Shows before/after file sizes
- Generates album JSON manifest with Cloudinary public IDs
- Automatically numbers photos
- Provides next-step instructions

**Requirements:**
- ImageMagick: `brew install imagemagick`

**Example workflow:**
```bash
# 1. Prepare photos from a folder
./scripts/prepare-photos.sh ~/Photos/queens-farm ./cloudinary-ready

# 2. Upload the optimized images to Cloudinary
# (use Cloudinary web interface or CLI)

# 3. Copy the JSON manifest to your content folder
cp ./cloudinary-ready/queens-farm.json src/content/albums/

# 4. Preview locally
npm run dev
```

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Find your "Cloud Name" in the dashboard
3. Add it to `.env`:
   ```
   PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```
4. Upload photos to folders like `reuben/album-name/`
5. Use the folder path in your album JSON manifests

**Image URL format:**
```
https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto,w_{width}/{publicId}.jpg
```

The site automatically generates responsive URLs with optimal formats (WebP, AVIF) and quality.

## Deployment

### GitHub Pages (Automated)

1. Push this project to a GitHub repository
2. Go to Settings → Pages
3. Set "Build and deployment" to "GitHub Actions"
4. The included workflow (`.github/workflows/deploy.yml`) will build and deploy on every push to `main`

### Custom Domain

Update `astro.config.mjs`:
```js
export default defineConfig({
  site: 'https://yourdomain.com',
});
```

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

## Development

```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Build for production
npm run preview      # Preview production build
npm run astro        # Run Astro CLI commands
```

## License

Personal project - feel free to use as inspiration for your own site!
