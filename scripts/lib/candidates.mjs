// Pure logic for picking which Goodreads shelf entries are "new" books to
// add to src/data/reading/{year}.json. Split out from update-reading.mjs so
// it's testable without that script's env-var side effects.

// `shelf` is the read shelf; `ratedDates` maps a bookId to the date it was
// rated, the closest thing to a finish date Goodreads still exposes publicly.
// A book with no known date always lands in the UNDATED_YEAR bucket rather
// than guessing the current year — a book can be marked read on Goodreads long
// after it was actually finished, and guessing the current year for those
// misfiles them. Anything already in `existingIds` is skipped, which also means
// a re-read isn't picked up: with no finish dates, a re-read looks identical to
// the original read (or to re-rating an old book), so those are added by hand.
export const UNDATED_YEAR = "2019-and-earlier";

export function selectCandidates(shelf, existingIds, ratedDates) {
  const candidates = [];
  for (const b of shelf) {
    if (existingIds.has(b.bookId)) continue;
    const dateReadIso = ratedDates.get(b.bookId) ?? null;
    candidates.push({ ...b, year: dateReadIso ? Number(dateReadIso.slice(0, 4)) : UNDATED_YEAR, dateReadIso });
  }
  return candidates;
}
