# Reuben's Personal Site (Astro + Tailwind + Cloudinary)

A lightweight static site with a simple landing page, blog, and photo galleries.

## Quick start

```bash
# 1) Install deps
npm install

# 2) Copy envs
cp .env.example .env
# Edit .env: set PUBLIC_CLOUDINARY_CLOUD_NAME to your Cloudinary cloud name

# 3) Run locally
npm run dev

# 4) Build
npm run build
npm run preview
```

## Structure

- `src/pages/` — routes
- `src/components/` — UI parts
- `src/layouts/` — shared layouts
- `src/content/` — blog posts and album manifests
- `public/` — static assets (favicons, social images)

## Cloudinary

- Upload photos to a folder like: `reuben/sample/` in your Cloudinary account.
- This starter uses **public IDs** from an album JSON manifest to assemble responsive image URLs.
- Set `PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env`.

## GitHub Pages Deploy

1. Create a new GitHub repo and push this project.
2. In your repo Settings → Pages, set "Build and deployment" to "GitHub Actions".
3. The included workflow `.github/workflows/deploy.yml` builds and publishes your site on pushes to `main`.

If your site is served from a subpath (e.g., `username.github.io/repo`), set `site` in `astro.config.mjs` accordingly and, if needed, configure a `base` in your GitHub Pages settings.

## Content

- Add posts under `src/content/posts/` as Markdown with frontmatter.
- Add album manifests under `src/content/albums/` using the sample JSON structure; drop in Cloudinary public IDs.
