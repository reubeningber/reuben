#!/usr/bin/env node
// Pulls new books from Goodreads and adds them to src/data/reading/{year}.json,
// uploading covers to Cloudinary. Also mirrors the "currently-reading" shelf to
// src/data/reading/currently-reading.json, which feeds the READING section on
// /now. Bumps the "Last updated on ..." text on /reading and /now whenever
// their respective data changes. Designed to run unattended (see
// .github/workflows/update-reading.yml) — writes files but never commits/opens
// a PR itself; the workflow's create-pull-request step handles that.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { lookupGenre } from "./lib/genre.mjs";
import { amazonLink, parseRatedDates, parseShelfWidget } from "./lib/goodreads.mjs";
import { selectCandidates, UNDATED_YEAR } from "./lib/candidates.mjs";

const GOODREADS_USER_ID = "7384813";
const DATA_DIR = new URL("../src/data/reading/", import.meta.url);
const CURRENTLY_READING_PATH = new URL("../src/data/reading/currently-reading.json", import.meta.url);
const NOW_PAGE_PATH = new URL("../src/pages/now.astro", import.meta.url);
const READING_PAGE_PATH = new URL("../src/pages/reading.astro", import.meta.url);
const LAST_UPDATED_RE = /Last updated on [A-Za-z]+ \d{1,2}, \d{4}/;

const CLOUD_NAME = requireEnv("PUBLIC_CLOUDINARY_CLOUD_NAME");
const API_KEY = requireEnv("CLOUDINARY_API_KEY");
const API_SECRET = requireEnv("CLOUDINARY_API_SECRET");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

const USER_AGENT = "reubeningber.com reading-page-sync";

async function fetchGoodreads(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Goodreads fetch failed: ${res.status} ${url}`);
  return res.text();
}

// The widget returns the shelf's 100 most recent books at most, with no paging,
// which is plenty for a weekly diff. Goodreads caches its output per widget_id
// and ignores every other param on later requests, so each fetch needs a new one.
async function fetchShelf(shelf, params = "") {
  const url =
    `https://www.goodreads.com/review/custom_widget/${GOODREADS_USER_ID}` +
    `?shelf=${shelf}&num_books=100&show_title=1&show_author=1&show_cover=1&show_rating=1&show_tags=1` +
    `&widget_id=${randomBytes(8).toString("hex")}${params}`;
  const books = parseShelfWidget(await fetchGoodreads(url));
  for (const b of books) {
    if (!b.bookId) console.warn(`  skipped (no Goodreads cover to get a book ID from): ${b.title}`);
  }
  return books.filter((b) => b.bookId);
}

async function fetchRatedDates() {
  return parseRatedDates(
    await fetchGoodreads(`https://www.goodreads.com/widgets/user_update_widget?num_updates=10&user=${GOODREADS_USER_ID}`)
  );
}

function loadCurrentlyReading() {
  return existsSync(CURRENTLY_READING_PATH) ? JSON.parse(readFileSync(CURRENTLY_READING_PATH, "utf-8")) : [];
}

function loadExisting() {
  const files = existsSync(DATA_DIR)
    ? readdirSync(DATA_DIR).filter((f) => /^\d{4}\.json$/.test(f) || f === `${UNDATED_YEAR}.json`)
    : [];
  const byYear = {};
  const existingIds = new Set();
  for (const file of files) {
    const year = file === `${UNDATED_YEAR}.json` ? UNDATED_YEAR : Number(file.replace(".json", ""));
    const filePath = new URL(file, DATA_DIR);
    const books = JSON.parse(readFileSync(filePath, "utf-8"));
    byYear[year] = books;
    for (const b of books) {
      const m = b.cover.match(/reading_covers\/(\w+)/);
      if (m) existingIds.add(m[1]);
    }
  }
  return { byYear, existingIds };
}

async function uploadCover(bookId, imgUrl) {
  const publicId = `reading_covers/${bookId}`;
  const bytes = await tryDownload(imgUrl);
  if (!bytes) return { ok: false };

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  const form = new FormData();
  form.set("api_key", API_KEY);
  form.set("timestamp", String(timestamp));
  form.set("public_id", publicId);
  form.set("signature", signature);
  form.set("file", new Blob([bytes]), "cover.jpg");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    console.error(`Cloudinary upload failed for ${bookId}: ${res.status} ${await res.text()}`);
    return { ok: false };
  }
  return { ok: true, publicId };
}

async function tryDownload(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function coverIdOf(book) {
  return book.cover.match(/reading_covers\/(\w+)/)?.[1];
}

function todayFormatted() {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function bumpLastUpdated(pagePath) {
  const html = readFileSync(pagePath, "utf-8");
  const updated = html.replace(LAST_UPDATED_RE, `Last updated on ${todayFormatted()}`);
  if (updated !== html) writeFileSync(pagePath, updated, "utf-8");
}

async function syncCurrentlyReading(knownCoverIds) {
  const shelf = await fetchShelf("currently-reading");
  const existing = loadCurrentlyReading();
  const existingByBookId = new Map(existing.map((e) => [coverIdOf(e), e]));
  const knownIds = new Set([...knownCoverIds, ...existingByBookId.keys()]);

  const entries = [];
  for (const b of shelf) {
    let cover = `reading_covers/${b.bookId}`;
    if (!knownIds.has(b.bookId)) {
      const upload = await uploadCover(b.bookId, b.img);
      if (!upload.ok) {
        console.warn(`  skipped currently-reading cover (upload failed): ${b.title}`);
        continue;
      }
      cover = upload.publicId;
    }

    const existingEntry = existingByBookId.get(b.bookId);
    const entry = {
      title: b.title,
      author: b.author,
      cover,
      amazon: existingEntry?.amazon ?? amazonLink(null, b.title, b.author),
    };
    if (b.audio) entry.audio = true;

    // Genre classification (a Claude lookup, or an Open Library subjects
    // heuristic as fallback — see lib/genre.mjs) is only worth re-running
    // when we don't already have an answer for this book, since currently-
    // reading entries are rebuilt from the live shelf every sync.
    if (existingEntry?.genre) {
      entry.genre = existingEntry.genre;
    } else {
      const genre = await lookupGenre({ title: b.title, author: b.author });
      if (genre) entry.genre = genre;
    }

    entries.push(entry);
  }

  const changed = JSON.stringify(entries) !== JSON.stringify(existing);
  if (changed) {
    writeFileSync(CURRENTLY_READING_PATH, JSON.stringify(entries, null, 2), "utf-8");
  }
  return { changed, entries };
}

async function main() {
  const { byYear, existingIds } = loadExisting();
  const previouslyReading = new Map(loadCurrentlyReading().map((e) => [coverIdOf(e), e]));

  const shelf = await fetchShelf("read", "&sort=date_read&order=d");
  const ratedDates = await fetchRatedDates();

  const candidates = selectCandidates(shelf, existingIds, ratedDates);

  if (candidates.length === 0) {
    console.log("No new read books found.");
  }

  console.log(`Found ${candidates.length} new read book(s):`);
  const added = [];
  const changedYears = new Set();
  for (const c of candidates) {
    console.log(`  - ${c.title} (${c.year})`);
    const upload = await uploadCover(c.bookId, c.img);
    if (!upload.ok) {
      console.warn(`    skipped (cover upload failed): ${c.title}`);
      continue;
    }
    const entry = {
      title: c.title,
      author: c.author,
      cover: upload.publicId,
      // A book usually passes through currently-reading first, so keep what
      // that entry already has rather than looking it up again.
      amazon: previouslyReading.get(c.bookId)?.amazon ?? amazonLink(null, c.title, c.author),
    };
    if (c.dateReadIso) entry.dateRead = c.dateReadIso;
    if (c.rating > 0) entry.rating = c.rating;
    if (c.audio) entry.audio = true;
    const genre = previouslyReading.get(c.bookId)?.genre ?? (await lookupGenre({ title: c.title, author: c.author }));
    if (genre) entry.genre = genre;
    byYear[c.year] = byYear[c.year] ?? [];
    byYear[c.year].push(entry);
    added.push(entry);
    changedYears.add(c.year);
  }

  for (const year of changedYears) {
    byYear[year].sort((a, b) => (b.dateRead ?? "").localeCompare(a.dateRead ?? ""));
    const filePath = new URL(`${year}.json`, DATA_DIR);
    writeFileSync(filePath, JSON.stringify(byYear[year], null, 2), "utf-8");
  }
  if (added.length > 0) bumpLastUpdated(READING_PAGE_PATH);

  console.log("\nSyncing currently-reading shelf for /now...");
  const currentlyReading = await syncCurrentlyReading(existingIds);
  if (currentlyReading.changed) {
    console.log(`  currently-reading list updated (${currentlyReading.entries.length} book(s))`);
    bumpLastUpdated(NOW_PAGE_PATH);
  } else {
    console.log("  no change");
  }

  if (added.length === 0 && !currentlyReading.changed) {
    console.log("\nNo changes to commit.");
    return;
  }

  const summaryParts = [];
  if (added.length > 0) {
    const lines = added.map((e) =>
      e.dateRead
        ? `- ${e.title} (dated ${e.dateRead} from its Goodreads rating, check it's the finish date)`
        : `- ${e.title} (no date available, filed under ${UNDATED_YEAR}, move it by hand)`
    );
    summaryParts.push(`Added ${added.length} book(s) to /reading:\n${lines.join("\n")}`);
  }
  if (currentlyReading.changed) {
    summaryParts.push(
      `Updated /now's currently-reading list (${currentlyReading.entries.length} book(s)):\n${currentlyReading.entries.map((e) => `- ${e.title}`).join("\n")}`
    );
  }
  const summary = summaryParts.join("\n\n");
  console.log(`\n${summary}`);

  if (process.env.GITHUB_OUTPUT) {
    const count = added.length + (currentlyReading.changed ? 1 : 0);
    writeFileSync(process.env.GITHUB_OUTPUT, `count=${count}\n`, { flag: "a" });
    const body = summary.replace(/%/g, "%25").replace(/\n/g, "%0A").replace(/\r/g, "%0D");
    writeFileSync(process.env.GITHUB_OUTPUT, `summary=${body}\n`, { flag: "a" });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
