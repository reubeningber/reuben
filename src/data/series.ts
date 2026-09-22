// Pillar ("series") pages: hand-curated groupings of related posts.
// Each series renders at /{slug}/ via src/pages/{slug}.astro + SeriesLayout.astro.
// Post titles and summaries come from the posts' own frontmatter; only the intro
// and section headings live here. Posts are referenced by filename (minus .md),
// which is also the article slug. tests/unit/series.test.ts checks they all exist.

export interface SeriesSection {
  heading: string;
  posts: string[];
}

export interface Series {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  sections: SeriesSection[];
}

export const series: Series[] = [
  {
    slug: 'parenting',
    title: 'Parenting',
    metaTitle: 'Parenting: Raising Two Kids in Queens · Reuben Ingber',
    description: 'Everything I have written about being a dad of two in Queens: daily habits, screens, planning family life, and the hard parts.',
    intro: "I'm a dad of two in Queens, and most of what I write comes back to Zeke and Judi. This is everything I've written about fatherhood in one place, from the small daily habits to the systems that keep our family running to the parts that are just hard.",
    sections: [
      {
        heading: 'Being a present dad',
        posts: [
          '2025-09-29-five-things-to-do-every-day-to-be-a-happier-dad',
          '2025-10-03-teach-your-kids-your-cell-number',
          '2026-07-22-7-things-ive-learned-in-7-years',
        ],
      },
      {
        heading: 'Kids, screens, and making things together',
        posts: [
          '2026-01-05-dads-should-read-the-anxious-generation',
          '2025-10-01-read-the-anxious-generation',
          '2025-11-10-building-something-real',
          '2026-03-07-we-built-a-bookcase',
          '2025-10-28-why-every-dad-should-have-a-digital-camera',
        ],
      },
      {
        heading: 'Running the household',
        posts: [
          '2026-04-27-the-summer-planning-session-is-one-of-my-favorite-nights-of-the-year',
          '2026-05-26-im-the-emergency-contact-the-school-still-calls-my-wife',
          '2026-08-31-how-i-finally-tamed-the-school-calendar-chaos',
          '2026-09-16-the-zeke-and-judi-weekly-briefing',
        ],
      },
      {
        heading: 'The hard parts',
        posts: [
          '2025-11-24-i-thought-i-was-distracted-turns-out-it-was-adhd',
          '2026-06-15-fathers-day-without-my-dad',
        ],
      },
    ],
  },
  {
    slug: 'adhd-and-motivation',
    title: 'ADHD, Habits & Motivation',
    metaTitle: 'ADHD, Habits & Motivation · Reuben Ingber',
    description: 'What I have learned about my ADHD, building habits that stick, and starting over when motivation runs out.',
    intro: "I was diagnosed with ADHD at 30, and it changed how I think about work, family, and why some habits stick while others don't. These posts follow that thread: understanding how my brain works, building habits that last, and starting over when they don't.",
    sections: [
      {
        heading: 'Understanding my ADHD',
        posts: [
          '2025-11-17-i-thought-work-was-boring-turns-out-i-have-adhd',
          '2025-11-24-i-thought-i-was-distracted-turns-out-it-was-adhd',
        ],
      },
      {
        heading: 'Building habits that stick',
        posts: [
          '2025-11-07-better-than-before-and-the-season-of-starting-over',
          '2026-01-13-three-books-to-read-when-your-new-year-s-resolutions-have-already-fallen-apart',
          '2023-02-16-how-one-index-card-can-drastically-improve-your-journaling',
          '2023-01-20-take-your-reading-to-a-new-level-and-reread-a-book-this-year',
        ],
      },
      {
        heading: 'Goals, obsession, and starting over',
        posts: [
          '2023-01-05-annual-themes',
          '2025-11-20-going-all-in',
          '2026-01-01-2026-the-year-of-doing-the-work-and-taking-the-kids-with-me',
          '2026-08-26-rebuilding-my-motivation-slowly',
        ],
      },
    ],
  },
];

export function seriesForPost(postSlug: string): Series[] {
  return series.filter(s => s.sections.some(sec => sec.posts.includes(postSlug)));
}
