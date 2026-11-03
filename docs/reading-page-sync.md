# The Reading Page and Its Goodreads Sync

`/reading` (added August 2026) is a tabbed, year-by-year grid of book covers — one tab per year back to 2020, each cover linking out to Amazon. It's kept up to date by a weekly automation, not by hand. The same automation also keeps the READING section on `/now` (Reuben's "currently reading" books) in sync with Goodreads, so there's a single script and a single source of truth for both pages.

## Why it isn't a content collection

Every other piece of content on the site — posts, field notes — lives in `src/content/{collection}/` as Markdown, validated by a Zod schema in `src/content/config.ts`, and is meant to be authored by a person (via `scripts/new-post.sh` or Pages CMS; see [content-and-cms.md](./content-and-cms.md)).

Reading data is different: it's a mirror of state that already exists somewhere else (Goodreads), refreshed automatically, never hand-written. It lives instead as plain JSON under `src/data/reading/{year}.json` — one file per year, each an array of `{ title, author, cover, amazon, dateRead?, rating?, audio? }` — and is imported directly into `reading.astro` at build time. No content collection, no frontmatter, no Zod schema; just data a script writes and a page reads.

## Where the covers actually live

None of the ~490 cover images are in this repo. They're uploaded to Cloudinary under the `reading_covers/` prefix, with the Goodreads `book_id` as the Cloudinary `public_id` (e.g. `reading_covers/223688289`) — stable and collision-free without needing to invent slugs. The `cover` field in each JSON entry is just that path; `reading.astro` builds the delivery URL itself (`f_auto,w_300/reading_covers/{id}`) rather than going through the `getImageConfig()` helper in `src/utils/cloudinary.ts` that every other image on the site uses, since that helper assumes the `web_assets/` folder convention and a single shared version token.

This was a scale decision, not a philosophical one: the original build only covered the current year (~30 books) and those covers were committed straight into `public/`, same as everything else. Once the page grew to cover 2020–2026 (~490 books), committing that many images stopped making sense, and they moved to Cloudinary instead — see [architecture.md](./architecture.md) for why Cloudinary is already the site's answer to "where do images live."

## Goodreads has no API for this — the widget workaround

Goodreads deprecated its public API years ago, and a user's shelf page (`/review/list/{id}?shelf=read`) requires being logged in. Each shelf's RSS feed (`/review/list_rss/{id}`) used to be the exception, until Goodreads retired those around October 28, 2026; they now return 404 for every user. What's left is two embed widgets that need no login:

```
https://www.goodreads.com/review/custom_widget/{user_id}?shelf=read&sort=date_read&order=d&num_books=100&show_title=1&show_author=1&show_cover=1&show_rating=1&show_tags=1&widget_id={random}
https://www.goodreads.com/widgets/user_update_widget?num_updates=10&user={user_id}
```

The shelf widget is a script that writes HTML, which `scripts/lib/goodreads.mjs` parses for title, author, cover, rating, and tags (`audio` is the only custom shelf in use). Things to know about it:

- **`widget_id` must be fresh on every request.** Goodreads caches output per ID and ignores every other param on later requests, so a repeated or missing ID can return the wrong shelf.
- **The `book_id` only appears in the cover image's filename** (`.../books/1420938349l/15803144._SY75_.jpg`). When this was switched over, it matched the stored ID on all 100 books returned. A book with Goodreads' placeholder cover has no ID, so the sync logs a warning and skips it.
- **It returns at most 100 books, with no paging.** That's fine for a weekly diff, but it can't backfill.
- **It has no ISBN**, so Amazon links for new books are search links rather than `/dp/` product links, and there's no Open Library cover fallback.
- **It has no finish date.** The updates widget fills this in: a book's "rated a book" date is used as its `dateRead`, which matched the real finish date on the recent books checked, since ratings usually happen on finishing. It's only an approximation, and it only reaches back about 10 updates.

Those gaps change what the sync can do:

- A new book with no rating date among those updates goes in `2019-and-earlier.json` rather than guessing a year, and the PR body says to move it by hand. The same goes for a book finished without being rated.
- Re-reads aren't detected. With no finish dates, a re-read looks the same as re-rating an old book, so anything already tracked is skipped and a re-read has to be added by hand.

## The weekly sync

`.github/workflows/update-reading.yml` runs `scripts/update-reading.mjs` every Monday (plus manual `workflow_dispatch`). The script:

1. Loads every `src/data/reading/{year}.json`, extracting each book's Goodreads `book_id` back out of its stored `reading_covers/{id}` cover path to know what's already tracked.
2. Fetches the read shelf widget and the rating dates (as above) and diffs against that set.
3. For anything new: downloads the cover, uploads it to Cloudinary via a hand-rolled signed upload (no SDK — just a SHA-1 signature over the sorted params plus the API secret, POSTed as multipart form data), and appends the entry to the right year's file.
4. Fetches the "currently-reading" shelf the same way and regenerates `src/data/reading/currently-reading.json` from scratch (not appended, since books drop off that shelf as they're finished or abandoned) — reusing a cover already in `reading_covers/` when the book_id is already known, uploading a new one otherwise. This file has the same `{ title, author, cover, amazon }` shape as the yearly files and is what `/now`'s READING section renders directly, so there's nothing to hand-maintain there either.
5. Writes a `count` and `summary` as GitHub Actions step outputs, covering both the newly-read books and any change to the currently-reading list.

If nothing changed on either shelf, the workflow no-ops — no empty PR. If something did, `peter-evans/create-pull-request` opens one on branch `automated/update-reading` (label `automated`, auto-deleted after merge). There's no separate alerting mechanism; the user already watches this repo, so GitHub's own PR notification is the alert.

Requires two secrets beyond the site's usual `PUBLIC_CLOUDINARY_CLOUD_NAME`: `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`, for the signed upload. These are scoped to this one workflow — `deploy.yml` and `scheduled-deploy.yml` (see [deployment.md](./deployment.md)) don't need them and don't use them, since the site's *build* just reads whatever JSON and Cloudinary URLs already exist.

## Lazy-loaded tabs

With ~490 covers across 7 years, rendering every `<img src>` at page load would mean fetching all of them up front. Instead, every cover starts as `<img data-src="...">` with no `src` attribute at all — so the browser makes zero requests for it — and a small inline script swaps `data-src` → `src` only for the currently active year's panel, the first time it's opened. Switching tabs is what triggers the fetch, not the page load.

## Search and the audio filter

The book-cover card markup lives in `src/components/ReadingCover.astro`, shared between the per-year tab panels and a flat, all-years grid (`#search-results`) that's hidden until needed. Typing in the search box filters that flat grid client-side by `data-title`/`data-author` substring match (case-insensitive, no server round-trip); the same lazy `data-src` → `src` swap from the year tabs applies here too, so only matched covers ever load.

A headphones toggle next to the year tabs filters that same flat grid to books with `audio: true` (sourced from the `audio` shelf on Goodreads — see above) instead of by search text. It's mutually exclusive with year browsing: selecting a year clears the audio filter and any search text, and selecting the audio filter deselects whichever year tab was active, since audiobooks span all years. On narrow viewports the year tabs and audio toggle collapse into a single `<select>` dropdown (`#year-filter-select`) to save space; both controls drive the same `selectYear()` / `setAudioOnly()` functions so they stay in sync regardless of which one the viewport is showing.
