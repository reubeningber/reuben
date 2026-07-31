# DNS and Cloudflare

Cloudflare's role here is easy to overstate — it's worth being precise about what it actually does for this site, because getting it wrong (as the colophon page and old docs did, calling this a "Cloudflare Pages" site) leads to confusing dead ends, like the Web Analytics setup below.

## What Cloudflare actually does

`reubeningber.com`'s nameservers point at Cloudflare (`oaklyn.ns.cloudflare.com`, `ashton.ns.cloudflare.com`), so Cloudflare is the **DNS provider**. That's it. The DNS records themselves are plain `A` records pointing straight at GitHub Pages' IPs (`185.199.108.153` etc.) — they are **not proxied** through Cloudflare (grey-cloud / "DNS only", not orange-cloud). Traffic goes browser → GitHub Pages directly; Cloudflare is never in the request path.

This matters because a lot of Cloudflare's zone-level features — the CDN/proxy, WAF, and anything that injects content into responses — only work for proxied (orange-cloud) records. DNS-only records get none of that.

## Why Web Analytics silently collected nothing

A Cloudflare Web Analytics "site" for `reubeningber.com` had existed in the Cloudflare dashboard for about a year before it ever recorded a visit. It was set to **automatic injection** — "the JS snippet will be automatically injected" — which relies on Cloudflare's proxy rewriting responses to insert the beacon script. Since this zone's records are DNS-only, no traffic ever passed through that proxy, so the snippet was never injected, and the dashboard sat at zero visits indefinitely with no error to explain why.

The fix (July 2026) was switching that Web Analytics site to **manual snippet installation** in the Cloudflare dashboard, which hands you a `<script>` tag with a beacon token instead of relying on proxy injection, and adding that script directly to `BaseLayout.astro` via `CloudflareAnalytics.astro`. This works regardless of proxy status, because the site itself — not Cloudflare's edge — is now responsible for loading the beacon.

## The lesson

"DNS is on Cloudflare" and "traffic goes through Cloudflare" are different claims. Any Cloudflare feature that depends on the proxy (automatic Web Analytics injection, WAF rules, caching, image optimization, etc.) requires orange-cloud records — check that before assuming a Cloudflare dashboard feature will "just work" on a domain that's only using Cloudflare for DNS.
