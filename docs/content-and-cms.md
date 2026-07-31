# Content and Pages CMS

## Two ways to write a post

**`./scripts/new-post.sh`** — interactive shell script. Prompts for title, date, image (+ credit), category; generates a URL-friendly slug; writes a properly formatted Markdown file into `src/content/posts/`. The fast path when working locally.

**Pages CMS** — a browser-based editor (pagescms.org) configured via `.pages.yml` at the repo root. Sign in with GitHub, edit through a form UI, and it commits Markdown straight back to `src/content/posts/` — no local checkout needed, useful for editing from a phone or anywhere without the dev environment set up. Adopted March 2026 ("Move to PagesCMS"). Its commits show up in history as `Update src/content/posts/... (via Pages CMS)`.

`.pages.yml` only configures the `posts` collection, not `field-notes` — field notes are Markdown-only, edited by hand or script, not through the CMS UI. That's a gap, not a deliberate design choice; it just hasn't been added.

Both paths write the same Markdown files with the same frontmatter — Pages CMS is purely an editing layer, not a separate data store. The Astro build reads directly from `src/content/posts/` either way.

## Posts vs. field notes

Field notes (added July 2026) exist because not everything is worth the ceremony of a full article: a link with a one-line reaction, a photo, an embed. They're a separate, lighter content collection — see [architecture.md](./architecture.md) — with their own paginated listing at `/field-notes/` and their own RSS feed, but no CMS support yet and no helper script (they're created by hand).

## Scheduling

Both collections filter out entries with a future `pubDate` at build time. Nothing publishes itself the moment you hit save — it publishes the next time the site *builds*, which is either the next push to `main` or the next scheduled cron rebuild. See [deployment.md](./deployment.md) for why that scheduled rebuild exists at all.
