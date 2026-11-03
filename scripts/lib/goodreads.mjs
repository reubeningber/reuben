// Pure helpers for parsing Goodreads' public widgets and building Amazon links.
// Split out from update-reading.mjs so they're importable without
// triggering that script's top-level requireEnv() side effects.

export function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// /review/custom_widget/{user} is a script that document.write()s the shelf as
// HTML inside a JS string literal. It has no ISBN or finish date fields, and
// the only thing carrying the Goodreads book_id is the cover image
// filename, so a book with a placeholder cover comes back with bookId: null.
export function parseShelfWidget(script) {
  if (!script.includes("gr_custom_container_")) {
    throw new Error("Goodreads shelf widget: unrecognized response");
  }
  const html = script.replace(/\\(.)/g, (_, c) => (c === "n" ? "\n" : c));
  return html
    .split(/class="gr_custom_each_container_\w*"/)
    .slice(1)
    .map((block) => {
      const img = block.match(/border="0" src="([^"]+)"/)?.[1] ?? "";
      return {
        title: decodeEntities(block.match(/<a title="([^"]*)"/)?.[1] ?? "").trim(),
        author: decodeEntities(block.match(/gr_custom_author_\w*"[^>]*>\s*by\s*<a[^>]*>([^<]*)/)?.[1] ?? "")
          .replace(/\s+/g, " ")
          .trim(),
        img: img.replace(/\._[^/.]*_(?=\.\w+$)/, ""),
        bookId: img.match(/\/(\d+)(?:\.[^/]*)$/)?.[1] ?? null,
        rating: (block.match(/star_active/g) ?? []).length,
        audio: (block.match(/gr_custom_tags_\w*"[^>]*>\s*tagged:([^<]*)/)?.[1] ?? "")
          // Written out as a sentence: "a", "a and b", or "a, b, and c".
          .split(/,?\s+and\s+|,\s*/)
          .map((s) => s.trim())
          .includes("audio"),
      };
    });
}

// /widgets/user_update_widget lists the user's last 10 updates, and is the only
// public source of dates left. Returns Map<bookId, YYYY-MM-DD> of when each
// book was rated. Only the first update of a day carries a date, and dates in
// the current year omit it, so both are filled in here.
export function parseRatedDates(html, now = Date.now()) {
  const dates = new Map();
  let date = null;
  for (const block of html.split(/<div class="update\b/).slice(1)) {
    const heading = block.match(/<p>\s*([A-Z][a-z]+) (\d{1,2})(?:, (\d{4}))?\s*<\/p>/);
    if (heading) date = resolveDate(heading[1], Number(heading[2]), heading[3], now);
    const bookId = block.match(/\/book\/show\/(\d+)/)?.[1];
    if (date && bookId && /rated a book/.test(block) && !dates.has(bookId)) dates.set(bookId, date);
  }
  return dates;
}

function resolveDate(month, day, year, now) {
  const monthIndex = new Date(`${month} 1, 2000`).getMonth();
  if (Number.isNaN(monthIndex)) return null;
  const currentYear = new Date(now).getUTCFullYear();
  let d = new Date(Date.UTC(year ? Number(year) : currentYear, monthIndex, day));
  // Allow a day of leeway since Goodreads and the runner may disagree on "today".
  if (!year && d.getTime() > now + 24 * 60 * 60 * 1000) {
    d = new Date(Date.UTC(currentYear - 1, monthIndex, day));
  }
  return d.toISOString().slice(0, 10);
}

export function amazonLink(isbn, title, author) {
  if (isbn && isbn.length === 10) return `https://www.amazon.com/dp/${isbn}`;
  const q = encodeURIComponent(`${title.split(":")[0].split("(")[0].trim()} ${author}`);
  return `https://www.amazon.com/s?k=${q}`;
}
