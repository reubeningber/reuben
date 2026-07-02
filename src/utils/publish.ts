function toDateString(date: Date | string): string {
  // A bare YYYY-MM-DD string has no timezone info; parsing it with `new Date()`
  // treats it as UTC midnight, which can shift the calendar day when read back
  // with local getters. Treat that shape as already-normalized and pass it through.
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const d = date instanceof Date ? date : new Date(date);
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

export function isPublished(pubDate: Date | string, draft: boolean, today: Date = new Date()): boolean {
  if (draft) return false;
  return toDateString(pubDate) <= toDateString(today);
}
