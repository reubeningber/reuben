// Pure helpers for parsing Goodreads' RSS feed and building Amazon links.
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

// Goodreads' <title> tag isn't CDATA-wrapped, so it can contain literal XML
// entities like "&apos;" that need decoding; other tags may be CDATA-wrapped
// (raw text, no decoding needed) or plain (needs decoding) depending on the
// field, so this handles both shapes and decodes either way.
export function field(item, tag) {
  const m = item.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[(.*?)\\]\\]>|(.*?))</${tag}>`, "s"));
  if (!m) return "";
  return decodeEntities((m[1] ?? m[2] ?? "").trim());
}

export function amazonLink(isbn, title, author) {
  if (isbn && isbn.length === 10) return `https://www.amazon.com/dp/${isbn}`;
  const q = encodeURIComponent(`${title.split(":")[0].split("(")[0].trim()} ${author}`);
  return `https://www.amazon.com/s?k=${q}`;
}
