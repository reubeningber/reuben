# SEO to-do (manual steps)

Follow-ups from the SEO review scanned on 2026-09-22 that need account access, so they can't be done in code. The code-side fixes shipped in the `seo-audit-fixes` branch.

## 1. HTTPS on the apex domain

Right now `http://reubeningber.com` doesn't redirect to HTTPS, and there's no `Strict-Transport-Security` header.

1. **GitHub → repo Settings → Pages.** Confirm the custom domain is `reubeningber.com` and check **Enforce HTTPS**. If the box is greyed out, GitHub hasn't issued the certificate yet. Because Cloudflare proxies the domain, you may need to switch the apex records to "DNS only" (grey cloud) for a few minutes while GitHub issues it, then switch them back to proxied.
2. **Cloudflare → DNS.** The apex should have the four GitHub Pages A records (`185.199.108.153` to `185.199.111.153`). The AAAA records are optional (see `DEPLOYMENT.md`). `www` should be a CNAME to `<user>.github.io`. Remove any stale records.
3. **Cloudflare → SSL/TLS → Overview.** Set the encryption mode to **Full** (not Flexible). Flexible can cause redirect loops with GitHub Pages.
4. **Cloudflare → SSL/TLS → Edge Certificates.** Turn on **Always Use HTTPS**.
5. On the same page, enable **HSTS**. Start with `max-age` of 1 month and leave *includeSubDomains* and *preload* off until you've confirmed every subdomain (for example `photos.reubeningber.com`) serves HTTPS. Raise it to 12 months after that.
6. Verify:
   ```bash
   curl -I http://reubeningber.com        # expect 301 → https://reubeningber.com/
   curl -I https://reubeningber.com       # expect strict-transport-security header
   ```

## 2. Google Search Console

1. Add a **Domain** property for `reubeningber.com` and verify it with the DNS TXT record in Cloudflare.
2. Under **Sitemaps**, submit `https://reubeningber.com/sitemap.xml`. This is now the only sitemap; `sitemap-index.xml` no longer exists, so remove it if it was submitted before.
3. After a few days, check **Pages** for the indexed vs. not-indexed counts. Look for draft URLs or old `sitemap-index.xml`/`sitemap-0.xml` entries that need to drop out.
4. Optionally, do the same in Bing Webmaster Tools (it can import from GSC).

## 3. Directory submissions

- [ ] Submit the homepage to [personalwebsites.org](https://personalwebsites.org).
- [ ] Submit `/now` to [nownownow.com](https://nownownow.com/about).
- [ ] Submit `/friends` to [slashfriends.org](https://slashfriends.org).

## 4. Point bios at the homepage

Business Insider's Medium pages currently outrank the site for "Reuben Ingber".

- [ ] LinkedIn: set the Website/Contact info field to `https://reubeningber.com/`.
- [ ] Medium profile bio: link to `https://reubeningber.com/`.
- [ ] GitHub, Instagram, X/Twitter, Threads/Bluesky and any author bios: link to the homepage.
- [ ] If possible, ask to have the Business Insider author page link to the site too.

## 5. Optional deeper crawl

- [ ] Run the `claude-seo` skill that's already in the repo (`/seo-audit https://reubeningber.com`) for a full crawl.
- [ ] Run `geo-seo-claude` for AI-search/GEO checks.
