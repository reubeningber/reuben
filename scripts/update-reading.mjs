#!/usr/bin/env node
// Pulls new books from Goodreads and adds them to src/data/reading/{year}.json,
// uploading covers to Cloudinary. Also mirrors the "currently-reading" shelf to
// src/data/reading/currently-reading.json, which feeds the READING section on
// /now. Designed to run unattended (see .github/workflows/update-reading.yml) —
// writes files but never commits/opens a PR itself; the workflow's
// create-pull-request step handles that.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { lookupGenre } from "./lib/genre.mjs";
import { field, amazonLink } from "./lib/rss.mjs";

const GOODREADS_USER_ID = "7384813";
const DATA_DIR = new URL("../src/data/reading/", import.meta.url);
const CURRENTLY_READING_PATH = new URL("../src/data/reading/currently-reading.json", import.meta.url);
const UNDATED_LOOKBACK_DAYS = 14;

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

async function fetchShelf(params) {
  const url = `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?${params}`;
  const res = await fetch(url, { headers: { "User-Agent": "reubeningber.com reading-page-sync" } });
  if (!res.ok) throw new Error(`Goodreads RSS fetch failed: ${res.status} ${url}`);
  const xml = await res.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items.map((it) => ({
    title: field(it, "title"),
    author: field(it, "author_name").replace(/\s+/g, " ").trim(),
    isbn: field(it, "isbn"),
    img: field(it, "book_large_image_url") || field(it, "book_medium_image_url"),
    bookId: field(it, "book_id"),
    dateRead: field(it, "user_read_at") || null,
    dateAdded: field(it, "user_date_added") || null,
    rating: Number(field(it, "user_rating")) || 0,
    audio: field(it, "user_shelves").split(",").map((s) => s.trim()).includes("audio"),
  }));
}

function loadExisting() {
  const files = existsSync(DATA_DIR) ? readdirSync(DATA_DIR).filter((f) => /^\d{4}\.json$/.test(f)) : [];
  const byYear = {};
  const existingIds = new Set();
  for (const file of files) {
    const year = Number(file.replace(".json", ""));
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

async function uploadCover(bookId, imgUrl, isbn) {
  const publicId = `reading_covers/${bookId}`;
  let bytes = await tryDownload(imgUrl);
  if (!bytes && isbn) {
    bytes = await tryDownload(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
  }
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

async function syncCurrentlyReading(knownCoverIds) {
  const shelf = await fetchShelf("shelf=currently-reading&per_page=100");
  const existing = existsSync(CURRENTLY_READING_PATH)
    ? JSON.parse(readFileSync(CURRENTLY_READING_PATH, "utf-8"))
    : [];
  const knownIds = new Set([...knownCoverIds, ...existing.map(coverIdOf)]);

  const entries = [];
  for (const b of shelf) {
    let cover = `reading_covers/${b.bookId}`;
    if (!knownIds.has(b.bookId)) {
      const upload = await uploadCover(b.bookId, b.img, b.isbn);
      if (!upload.ok) {
        console.warn(`  skipped currently-reading cover (upload failed): ${b.title}`);
        continue;
      }
      cover = upload.publicId;
    }
    entries.push({
      title: b.title,
      author: b.author,
      cover,
      amazon: amazonLink(b.isbn, b.title, b.author),
    });
  }

  const changed = JSON.stringify(entries) !== JSON.stringify(existing);
  if (changed) {
    writeFileSync(CURRENTLY_READING_PATH, JSON.stringify(entries, null, 2), "utf-8");
  }
  return { changed, entries };
}

function daysAgo(rfc2822Date) {
  const d = new Date(rfc2822Date);
  return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
}

function toIsoDate(rfc2822Date) {
  return new Date(rfc2822Date).toISOString().slice(0, 10);
}

async function main() {
  const { byYear, existingIds } = loadExisting();

  const dated = await fetchShelf("shelf=read&sort=date_read&order=d&per_page=100");
  const defaultOrder = await fetchShelf("shelf=read&per_page=100");

  const candidates = [];
  const currentYear = new Date().getFullYear();

  for (const b of dated) {
    if (!b.dateRead || existingIds.has(b.bookId)) continue;
    candidates.push({ ...b, year: new Date(b.dateRead).getFullYear(), dateReadIso: toIsoDate(b.dateRead) });
  }

  for (const b of defaultOrder) {
    if (b.dateRead || existingIds.has(b.bookId)) continue;
    if (candidates.some((c) => c.bookId === b.bookId)) continue;
    if (!b.dateAdded || daysAgo(b.dateAdded) > UNDATED_LOOKBACK_DAYS) continue;
    candidates.push({ ...b, year: currentYear, dateReadIso: null });
  }

  if (candidates.length === 0) {
    console.log("No new read books found.");
  }

  console.log(`Found ${candidates.length} new read book(s):`);
  const added = [];
  const changedYears = new Set();
  for (const c of candidates) {
    console.log(`  - ${c.title} (${c.year})`);
    const upload = await uploadCover(c.bookId, c.img, c.isbn);
    if (!upload.ok) {
      console.warn(`    skipped (cover upload failed): ${c.title}`);
      continue;
    }
    const entry = {
      title: c.title,
      author: c.author,
      cover: upload.publicId,
      amazon: amazonLink(c.isbn, c.title, c.author),
    };
    if (c.dateReadIso) entry.dateRead = c.dateReadIso;
    if (c.rating > 0) entry.rating = c.rating;
    if (c.audio) entry.audio = true;
    const genre = await lookupGenre({ isbn: c.isbn, title: c.title, author: c.author });
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

  console.log("\nSyncing currently-reading shelf for /now...");
  const currentlyReading = await syncCurrentlyReading(existingIds);
  if (currentlyReading.changed) {
    console.log(`  currently-reading list updated (${currentlyReading.entries.length} book(s))`);
  } else {
    console.log("  no change");
  }

  if (added.length === 0 && !currentlyReading.changed) {
    console.log("\nNo changes to commit.");
    return;
  }

  const summaryParts = [];
  if (added.length > 0) {
    summaryParts.push(`Added ${added.length} book(s) to /reading:\n${added.map((e) => `- ${e.title}`).join("\n")}`);
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
