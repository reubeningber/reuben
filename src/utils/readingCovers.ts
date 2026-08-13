// Shared cover-URL logic for src/data/reading/*.json entries, used by
// reading.astro and now.astro. Covers are normally a Cloudinary
// reading_covers/{book_id} path, but now.astro's seed data can also point
// straight at a local/absolute image URL, so pass those through untouched.
export function readingCoverUrl(cloudName: string, path: string): string {
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,w_300/${path}`;
}
