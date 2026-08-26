// Pure logic for picking which Goodreads shelf entries are "new" books to
// add to src/data/reading/{year}.json. Split out from update-reading.mjs so
// it's testable without that script's env-var side effects.

export function daysAgo(rfc2822Date, now = Date.now()) {
  const d = new Date(rfc2822Date);
  return (now - d.getTime()) / (1000 * 60 * 60 * 24);
}

export function toIsoDate(rfc2822Date) {
  return new Date(rfc2822Date).toISOString().slice(0, 10);
}

// `dated` is the shelf sorted by date_read (used for books with an explicit
// finish date); `defaultOrder` is the same shelf unsorted, which is the only
// order undated entries show up in reliably. A book with no dateRead is only
// picked up if it was added to Goodreads within `lookbackDays` of `now` —
// otherwise old undated backlog entries would flood in as "new" on every
// run. Since there's no real date to go on, undated books always land in the
// UNDATED_YEAR bucket rather than guessing the current year — a book can be
// marked read/rated on Goodreads (recent dateAdded) long after it was
// actually finished, and guessing the current year for those misfiles them.
// Books already present in `existingIds` (already in a data file) are always
// skipped, and a book present in both shelves is only added once (the dated
// pass takes priority).
export const UNDATED_YEAR = "2019-and-earlier";

export function selectCandidates(dated, defaultOrder, existingIds, lookbackDays, now = Date.now()) {
  const candidates = [];

  for (const b of dated) {
    if (!b.dateRead || existingIds.has(b.bookId)) continue;
    candidates.push({ ...b, year: new Date(b.dateRead).getFullYear(), dateReadIso: toIsoDate(b.dateRead) });
  }

  for (const b of defaultOrder) {
    if (b.dateRead || existingIds.has(b.bookId)) continue;
    if (candidates.some((c) => c.bookId === b.bookId)) continue;
    if (!b.dateAdded || daysAgo(b.dateAdded, now) > lookbackDays) continue;
    candidates.push({ ...b, year: UNDATED_YEAR, dateReadIso: null });
  }

  return candidates;
}
