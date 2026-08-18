// Maps a book to one of a fixed set of genres. The primary path
// (classifyGenre) asks Claude, which knows most books directly and isn't
// fooled by noisy publisher/BISAC subject tags the way keyword matching is
// (e.g. Nomadland and Dopesick both carry a "BUSINESS & ECONOMICS" subject
// tag on Open Library despite neither being a business book). The
// Open-Library-subjects heuristic below (classify/fetchSubjects) is kept
// only as a fallback for when no ANTHROPIC_API_KEY is configured.

export const GENRES = [
  "Memoir",
  "Biography",
  "Investigative Journalism",
  "True Crime",
  "Business",
  "Self-Help",
  "Psychology",
  "Health & Fitness",
  "Sports",
  "Parenting",
  "History",
  "Politics",
  "Science",
  "Religion & Spirituality",
  "Humor",
  "Travel",
  "Essays",
  "Poetry",
  "Graphic Novel",
  "Young Adult",
  "Children's",
  "Science Fiction",
  "Fantasy",
  "Mystery & Thriller",
  "Fiction",
  "Nonfiction",
];

// Checked in this order; a subject can only contribute to the first
// category it matches so more specific genres (e.g. Science Fiction) win
// over generic ones (e.g. Fiction).
const RULES = [
  ["Memoir", ["memoir", "personal narratives", "autobiography"]],
  ["True Crime", ["true crime", "murderers", "serial killers"]],
  ["Biography", ["biography"]],
  ["Business", ["business", "entrepreneurship", "management", "economics", "leadership", "corporations"]],
  ["Self-Help", ["self-help", "self help", "self-realization", "conduct of life", "success", "happiness"]],
  ["Psychology", ["psychology", "psychological aspects", "mental health", "mindfulness", "anxiety", "cognitive", "emotions"]],
  ["Health & Fitness", ["health", "fitness", "diet", "nutrition", "physical fitness", "exercise", "wellness", "nursing"]],
  ["Sports", ["sports", "runners", "running", "athletes", "triathlon", "marathon", "baseball", "basketball", "football", "olympics"]],
  ["Parenting", ["parenting", "fatherhood", "motherhood", "child rearing", "infants", "child care"]],
  ["Politics", ["politics", "political", "government", "president", "democracy", "presidents"]],
  ["History", ["history"]],
  ["Religion & Spirituality", ["religion", "spirituality", "hinduism", "christianity", "buddhism", "faith", "monastic", "religious life"]],
  ["Science", ["science", "technology", "physics", "biology", "computers", "artificial intelligence", "medicine"]],
  ["Humor", ["humor", "comedy", "satire"]],
  ["Travel", ["travel", "voyages and travels", "description and travel"]],
  ["Essays", ["essays"]],
  ["Poetry", ["poetry"]],
  ["Graphic Novel", ["comics", "graphic novel", "comic books"]],
  ["Young Adult", ["young adult fiction", "young adult"]],
  ["Children's", ["juvenile fiction", "juvenile literature", "children's fiction", "children's books"]],
  ["Science Fiction", ["science fiction"]],
  ["Fantasy", ["fantasy"]],
  ["Mystery & Thriller", ["mystery", "mystery fiction", "thriller", "suspense", "detective"]],
  ["Fiction", ["fiction"]],
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Word-boundary matching, not plain substring: NYT-list subject tags like
// "nyt:paperback-nonfiction=2023-05-14" contain the literal text "fiction"
// (inside "nonfiction") and would otherwise false-positive as Fiction.
const KEYWORD_PATTERNS = RULES.map(([genre, keywords]) => [
  genre,
  keywords.map((kw) => ({ kw, re: new RegExp(`\\b${escapeRegExp(kw)}\\b`, "i") })),
]);

export function classify(subjects) {
  if (!subjects || subjects.length === 0) return null;
  const scores = new Map();
  for (const subject of subjects) {
    // A subject can match several rules (e.g. "science fiction" matches
    // both "science" and "science fiction"); the longest keyword match is
    // the most specific one, so it wins the point for this subject.
    let bestGenre = null;
    let bestLen = 0;
    for (const [genre, patterns] of KEYWORD_PATTERNS) {
      for (const { kw, re } of patterns) {
        if (re.test(subject) && kw.length > bestLen) {
          bestGenre = genre;
          bestLen = kw.length;
        }
      }
    }
    if (bestGenre) scores.set(bestGenre, (scores.get(bestGenre) ?? 0) + 1);
  }
  if (scores.size === 0) return null;
  // Highest score wins; ties broken by RULES order (more specific first).
  let best = null;
  let bestScore = -1;
  for (const [genre] of RULES) {
    const score = scores.get(genre) ?? 0;
    if (score > bestScore) {
      best = genre;
      bestScore = score;
    }
  }
  return best;
}

export async function fetchSubjects({ isbn, title, author }) {
  if (isbn) {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const res = await fetch(url, { headers: { "User-Agent": "reubeningber.com reading-page-genre (contact: reuben.ingber@gmail.com)" } });
    if (res.ok) {
      const data = await res.json();
      const subjects = data[`ISBN:${isbn}`]?.subjects?.map((s) => s.name);
      if (subjects && subjects.length > 0) return subjects;
    }
  }
  const cleanTitle = title.split(":")[0].split("(")[0].trim();
  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&author=${encodeURIComponent(author)}&limit=1&fields=subject`;
  const res = await fetch(url, { headers: { "User-Agent": "reubeningber.com reading-page-genre (contact: reuben.ingber@gmail.com)" } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.docs?.[0]?.subject ?? null;
}

async function classifyWithClaude({ title, author }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return undefined; // caller falls back to the heuristic

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 20,
      messages: [
        {
          role: "user",
          content:
            `Classify the book "${title}" by ${author} into exactly one of these genres:\n` +
            GENRES.join(", ") +
            `\n\nReply with only the genre name, exactly as spelled above. If you don't recognize the book or none fit well, reply "None".`,
        },
      ],
    }),
  });
  if (!res.ok) {
    console.warn(`  Claude genre lookup failed (${res.status}) for "${title}", falling back to Open Library heuristic`);
    return undefined;
  }
  const data = await res.json();
  const answer = data.content?.[0]?.text?.trim();
  return GENRES.includes(answer) ? answer : null;
}

export async function lookupGenre(book) {
  const claudeGenre = await classifyWithClaude(book);
  if (claudeGenre !== undefined) return claudeGenre;

  const subjects = await fetchSubjects(book);
  return classify(subjects);
}
