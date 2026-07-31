# Analytics

A short history, because the set of tools has changed more than once.

## Google Analytics (GA4) — added June 2026, still active

Added via `gtag.js` directly in `BaseLayout.astro` ("Add Google Analytics (gtag.js) to base layout"). Hardcoded tag `G-8DBW26ND7K`. No env var, no conditional rendering — always active in production.

## Plausible — added at some point, removed July 2026

Plausible was wired up as a conditionally-rendered component (`Plausible.astro`, only rendering if `PUBLIC_PLAUSIBLE_DOMAIN` was set) and mentioned in the colophon page's stack list. It was never actually turned on — the env var was never set — so it shipped in the codebase for a while as dead code before being removed entirely: the component, the `BaseLayout.astro` import, the env var, and every doc reference to it.

## Cloudflare Web Analytics — added July 2026, active

Added via a hardcoded beacon token in `CloudflareAnalytics.astro`, unconditionally rendered in `BaseLayout.astro`. Chosen because it's free, privacy-first (no cookies, no consent banner needed), and the DNS was already on Cloudflare — see [dns-and-cloudflare.md](./dns-and-cloudflare.md) for why "DNS is on Cloudflare" didn't mean this was a five-minute toggle in the dashboard the way it is for a proxied (orange-cloud) domain.

## Why two tools running at once

GA4 and Cloudflare Web Analytics currently run in parallel rather than picking one. GA4 is the more full-featured/familiar tool; Cloudflare Web Analytics is the privacy-first, no-cookie-banner-needed option that came essentially free with DNS already being on Cloudflare. Nothing forces a choice between them — both are lightweight beacon scripts with no meaningful performance cost, so there was no strong reason to remove either once both were working.
