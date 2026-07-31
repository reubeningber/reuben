# Deployment

## GitHub Pages, not Cloudflare Pages

The site is built and deployed by GitHub Actions to **GitHub Pages** with a custom domain (`reubeningber.com`). This has been true since October 2025 ("Configure for Github Pages deployment"). Cloudflare only handles DNS for the domain — it has never hosted the actual pages here, despite the colophon page and older docs saying otherwise (a mislabel that's since been corrected; see [dns-and-cloudflare.md](./dns-and-cloudflare.md) for why that distinction actually matters).

## Two deploy workflows, and why

**`.github/workflows/deploy.yml`** — the normal path. Triggers on every push to `main`. Builds with `npm run build`, uploads `dist/` as a Pages artifact, deploys via `actions/deploy-pages`.

**`.github/workflows/scheduled-deploy.yml`** — triggers on a daily cron (`0 9 * * *`, 9am UTC) plus manual dispatch. This exists because the site is fully static: a post scheduled for a future `pubDate` is filtered out of the build until the build happens *after* that date. Without a scheduled rebuild, a post dated "tomorrow" would sit invisible forever, because nothing would trigger a new build on that date — nobody's pushing to `main` at midnight. The cron job rebuilds and redeploys once a day so scheduled posts actually appear on their publish date, not just whenever the next real commit happens to land.

(This workflow also deploys via a different mechanism — `peaceiris/actions-gh-pages` pushing straight to the `gh-pages` branch with a `cname` — rather than the newer `actions/deploy-pages` flow the main workflow uses. Both end up serving the same GitHub Pages site; they just predate/postdate a GitHub Pages deployment-method change and were never consolidated.)

## Custom domain

`public/CNAME` (or the `cname:` field in the scheduled workflow) pins the custom domain so GitHub Pages doesn't reset it to the `github.io` URL on each deploy. DNS records for `reubeningber.com` point directly at GitHub Pages' IPs — see [dns-and-cloudflare.md](./dns-and-cloudflare.md).

## Secrets

The only build-time secret is `PUBLIC_CLOUDINARY_CLOUD_NAME`, stored in GitHub Actions secrets and passed as an env var to the build step in both workflows. Everything else the site needs (GA4 tag, Cloudflare Analytics beacon token) is hardcoded directly in the components that use them — they're not actually secret, since they ship in the page source to every visitor either way.
