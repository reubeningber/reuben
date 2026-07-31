# Why photos left this repo

Photo galleries used to live here. `src/content/albums/` held JSON manifests (title, description, Cloudinary public IDs per photo), `PhotoGrid.astro` and `PhotoGridWithLightbox.astro` rendered them, and PhotoSwipe powered the full-screen lightbox. A helper script, `scripts/prepare-photos.sh`, resized and compressed a folder of photos with ImageMagick and generated the album JSON to go with them.

That's all gone now, removed in two steps:

1. **May 7, 2026 — "Move photos navigation to external site."** The `PHOTOS` nav link started pointing at `photos.reubeningber.com`, a separate site, while the album pages and components still existed here.
2. **May 26, 2026 — "Remove photos."** The now-redundant pages, components, and album JSON were deleted from this repo entirely.

`scripts/prepare-photos.sh` survived both of those cleanups by accident — it kept generating manifests for a collection (`src/content/albums/`) that no longer existed here, so its output had nowhere to go. It was finally removed in July 2026 once that was noticed.

## Why split it out at all

The two sites serve different purposes: this one is writing (articles, field notes, the personal/professional stuff), the other is a dedicated photography portfolio. Splitting them means the photo site can have its own design, its own gallery/lightbox tooling, and its own release cadence without every photography-specific dependency (PhotoSwipe, album-manifest tooling) living inside what's otherwise a fairly simple blog. The cost is that this repo's `Header.astro`/`Footer.astro` just link out to an `<a target="_blank">` for photos rather than rendering anything locally — there's no shared layout or design-system link between the two sites beyond that.
