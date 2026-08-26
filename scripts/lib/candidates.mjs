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
// skipped in the undated pass, and a book present in both shelves is only
// added once (the dated pass takes priority). The dated pass instead dedupes
// on `existingDatedReads`, a set of `bookId|dateReadIso` keys, so a genuine
// re-read (same book, new finish date after finishing it again on Goodreads)
// still gets added — but only if some *other* dated entry already exists for
// that bookId (`existingIdsWithDate`). Without that check, a book that was
// filed undated (no dateRead) and later got a date set on Goodreads for that
// same read would look exactly like a re-read and get double-added instead
// of just having its one entry backfilled with a date by hand.
export const UNDATED_YEAR = "2019-and-earlier";

export function selectCandidates(dated, defaultOrder, existingIds, existingDatedReads, existingIdsWithDate, lookbackDays, now = Date.now()) {
  const candidates = [];

  for (const b of dated) {
    if (!b.dateRead) continue;
    const dateReadIso = toIsoDate(b.dateRead);
    if (existingDatedReads.has(`${b.bookId}|${dateReadIso}`)) continue;
    if (existingIds.has(b.bookId) && !existingIdsWithDate.has(b.bookId)) continue;
    candidates.push({ ...b, year: new Date(b.dateRead).getFullYear(), dateReadIso });
  }

  for (const b of defaultOrder) {
    if (b.dateRead || existingIds.has(b.bookId)) continue;
    if (candidates.some((c) => c.bookId === b.bookId)) continue;
    if (!b.dateAdded || daysAgo(b.dateAdded, now) > lookbackDays) continue;
    candidates.push({ ...b, year: UNDATED_YEAR, dateReadIso: null });
  }

  return candidates;
}
