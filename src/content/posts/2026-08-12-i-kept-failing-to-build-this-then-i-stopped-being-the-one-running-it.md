---
title: The Reading Page I Finally Got Right
subTitle: Two false starts, a weekend with Claude Code, and 489 books later
pubDate: 2026-08-12
category: Engineering
tags:
  - ai
  - automation
  - personal-site
  - reading
description: After two failed attempts over the years, I finally built a self-updating /reading page — scraping Goodreads' undocumented RSS feed, hosting covers on Cloudinary, and syncing weekly via a GitHub Action that opens a PR.
---
I've tried to build a [reading page](/reading/) for this site at least twice before.

The first time, it was a page I hand-updated. Finish a book, open the repo, find the right file, paste in a title and a cover URL, commit, deploy. It worked for about six weeks. Then I finished a book on a Tuesday night with a toddler asleep on my chest, and the page just didn't get updated. Neither did the next one. Eventually I stopped opening the file.

The second time, I tried to script it. I don't fully remember what broke — some mix of scope creep and losing the thread on my own code a few months later — but the script rotted the way scripts do when nobody touches them. I gave up on that one too.

This week I got it working, and I don't think it's going anywhere.

The idea was never the hard part: show every book I've read, pull the data from Goodreads since that's where I actually log books, stop thinking about it after that. What killed both earlier attempts was the maintenance — the part where a working thing needs someone to keep feeding it, forever, or it stops working.

Goodreads doesn't have a public API for a user's shelf anymore. Load the profile or shelf page without being logged in and you get a sign-in wall. But the RSS feed for a shelf is still public and unauthenticated, and it returns clean data — title, author, ISBN, cover URL, the date you finished it. That's the whole page, in one URL.

Even with that, the numbers didn't match at first. Goodreads' own reading-challenge widget said 31 books for 2026. The feed, filtered to this year, gave me 27. Four books turned out to be shelved as "read" with no finish date ever logged, which made them invisible to anything sorting by date. I found them by pulling the shelf in its default order instead and looking for the gaps. Small mystery, satisfying to close.

From there it escalated past "just 2026." Same feed, pulled back to 2020, landed on 489 books across seven years. That's 489 cover images — too many to commit into the git repo — so they live on Cloudinary now, filed under the Goodreads book ID, in a folder that didn't exist a week ago. One cover was broken on Goodreads' end; Open Library had it by ISBN instead. The page is a tabbed grid, one tab per year, covers only, each one linking out to buy it, and nothing loads until you open that year.

None of that — the RSS trick, the signed Cloudinary uploads, the lazy-loaded tabs — is what killed the earlier attempts. That was all just code, and code was never the bottleneck. I was the one who had to remember to run it, six months later, and I never did.

So the last piece was a GitHub Action. Every Monday it re-checks the feed, catches anything new, uploads the cover, updates the year's file, and opens a pull request — only if something actually changed. No auto-commit to main; I review the PR like anyone else's. I didn't even build a new alert for it. I already watch the repo, so GitHub emails me the second the PR shows up. Nothing new to babysit.

I've been slowly pulling the things I care about off other people's platforms and onto my own domain — this blog instead of Medium, now this. Goodreads is still in there, technically, but only as a read-only source I hit through a URL that could vanish tomorrow. If it does, I'll deal with it then. For now, the actual list of everything I've read lives on reubeningber.com, not behind someone else's login.

Two attempts died because I was the automation. This one works because, for once, I wasn't.
