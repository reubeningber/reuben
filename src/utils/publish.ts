function toDateString(date: Date | string): string {
  // A bare YYYY-MM-DD string has no timezone info; parsing it with `new Date()`
  // treats it as UTC midnight. Reading that back with *local* getters shifts the
  // calendar day depending on the host's timezone offset. Use UTC getters
  // consistently for both `pubDate` and `today` so the comparison is deterministic
  // regardless of what timezone `npm run dev`/`npm run build` happens to run in,
  // and matches the UTC timezone the production build (GitHub Actions) runs in.
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const d = date instanceof Date ? date : new Date(date);
  return d.getUTCFullYear() + '-' +
    String(d.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(d.getUTCDate()).padStart(2, '0');
}

export function isPublished(pubDate: Date | string, draft: boolean, today: Date = new Date()): boolean {
  if (draft) return false;
  return toDateString(pubDate) <= toDateString(today);
}
