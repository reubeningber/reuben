# Architecture

## The stack

- **[Astro 5](https://astro.build)** — static site generation, no server at runtime. Every route in `src/pages/` is either an `.astro` file rendered to static HTML at build time, or a `.js` file that generates a feed (`rss.xml.js`, `sitemap.xml.js`).
- **Tailwind CSS v3** — utility classes, one custom accent color (`#ea580c`, orange) defined in `tailwind.config.cjs`.
- **Cloudinary** — every image on the site (post headers, the homepage portrait) is a Cloudinary URL built with transform params (`f_auto,q_auto,w_{width}`), not a locally hosted asset. `PUBLIC_CLOUDINARY_CLOUD_NAME` is the only build-time secret the site needs.
- **Zod**, via Astro's content collections, validates post/field-note frontmatter at build time — a malformed date or missing required field fails the build instead of shipping broken content.

There's no client-side framework (no React/Vue/Svelte) and no database. The entire site is `npm run build` → a folder of static HTML in `dist/` → served as-is.

## Content collections

`src/content/config.ts` defines two collections:

- **`posts`** — long-form articles. Required: `title`, `pubDate`. Everything else (`category`, `tags`, `image`, `description`, etc.) is optional and feeds into SEO metadata, category filtering, and RSS.
- **`field-notes`** — short-form entries (a link, an image, or an embed, plus optional commentary). Required: `title`, `pubDate`, `type` (`link` | `image` | `embed`). Field notes were added July 2026 (see below) as a lower-friction way to post than a full article.

Both collections filter out `draft: true` entries and anything with a future `pubDate` at build time — see [deployment.md](./deployment.md) for how future-dated posts actually go live without anyone touching the repo.

There used to be a third collection, `albums` (JSON files describing photo galleries). It's gone — see [photos-migration.md](./photos-migration.md).

## Layouts and pages

- `BaseLayout.astro` is the root `<html>` shell: meta tags, Open Graph, JSON-LD structured data, the two analytics beacons, favicon links. Every page wraps it.
- `PostLayout.astro` wraps `BaseLayout` for article pages — header image, post navigation (prev/next), category tag.
- Everything else in `src/pages/` is a standalone route: `start-here.astro`, `now.astro`, `uses.astro`, `friends.astro`, `colophon.astro`, `identity-statement.astro`, `contact.astro`.

## SEO

A batch of 17 SEO fixes landed in June 2026 (schema.org JSON-LD blocks per page type, breadcrumb schema, image object schema, canonical URLs, meta descriptions falling back to a post's first paragraph). Those live directly in `BaseLayout.astro`, `PostLayout.astro`, and `Breadcrumbs.astro` rather than as a separate system — there's no SEO plugin, just hand-written `<meta>` and `<script type="application/ld+json">` blocks.

## Testing

Added July 2026: Vitest for unit tests (pure logic — Cloudinary URL building, publish-date filtering) and Playwright for end-to-end smoke tests (homepage, articles, field notes, RSS, sitemap all render without erroring). Both run in CI on every push/PR via `.github/workflows/test.yml`. Before that, the only feedback loop was "does `npm run build` succeed and does the deployed page look right."
