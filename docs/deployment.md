# Deployment

## GitHub Pages, not Cloudflare Pages

The site is built and deployed by GitHub Actions to **GitHub Pages** with a custom domain (`reubeningber.com`). This has been true since October 2025 ("Configure for Github Pages deployment"). Cloudflare only handles DNS for the domain — it has never hosted the actual pages here, despite the colophon page and older docs saying otherwise (a mislabel that's since been corrected; see [dns-and-cloudflare.md](./dns-and-cloudflare.md) for why that distinction actually matters).

## Two deploy workflows, one mechanism

**`.github/workflows/deploy.yml`** — the normal path. Triggers once the `Test` workflow finishes successfully on `main` (via `workflow_run` — see below), or manually via `workflow_dispatch`. Builds with `npm run build`, uploads `dist/` as a Pages artifact, deploys via `actions/deploy-pages`.

**`.github/workflows/scheduled-deploy.yml`** — triggers on a daily cron (`0 9 * * *`, 9am UTC) plus manual dispatch. This exists because the site is fully static: a post scheduled for a future `pubDate` is filtered out of the build until the build happens *after* that date. Without a scheduled rebuild, a post dated "tomorrow" would sit invisible forever, because nothing would trigger a new build on that date — nobody's pushing to `main` at midnight. The cron job rebuilds and redeploys once a day so scheduled posts actually appear on their publish date, not just whenever the next real commit happens to land.

Both workflows use the same build-and-deploy shape (`actions/upload-pages-artifact` → `actions/deploy-pages`) and share the `pages` concurrency group, which is required so an overlapping scheduled run and a push-triggered run can't race each other. That wasn't always true — the scheduled workflow used to deploy via a different, older mechanism (`peaceiris/actions-gh-pages` pushing straight to a `gh-pages` branch) left over from before GitHub Pages' native Actions deployment flow existed. It was consolidated onto `actions/deploy-pages` once that inconsistency was noticed (2026-07-31).

## Deploy gated on tests

`deploy.yml` triggers via `workflow_run` on the `Test` workflow rather than directly on `push`, and only runs its `build` job if that test run's `conclusion` was `success` (checked out at the exact commit that was tested, via `github.event.workflow_run.head_sha`). Before this, `deploy.yml` and `test.yml` both triggered on the same push independently, so a failing test never actually blocked a bad build from going live — added 2026-07-31.

The scheduled workflow doesn't have an equivalent gate: nothing runs `Test` on a schedule, so there's nothing for it to wait on. It just builds and deploys directly, same as before.

## Custom domain

`public/CNAME` pins the custom domain so GitHub Pages doesn't reset it to the `github.io` URL on each deploy — both workflows pick it up automatically as part of `dist/` since it lives in `public/`. DNS records for `reubeningber.com` point directly at GitHub Pages' IPs — see [dns-and-cloudflare.md](./dns-and-cloudflare.md).

## Secrets

The only build-time secret is `PUBLIC_CLOUDINARY_CLOUD_NAME`, stored in GitHub Actions secrets and passed as an env var to the build step in both workflows. Everything else the site needs (GA4 tag, Cloudflare Analytics beacon token) is hardcoded directly in the components that use them — they're not actually secret, since they ship in the page source to every visitor either way.

A third workflow, `update-reading.yml`, uses two additional secrets (`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) for signed Cloudinary uploads — but only that workflow needs them, not the site build. See [reading-page-sync.md](./reading-page-sync.md).
