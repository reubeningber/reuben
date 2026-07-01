---
title: "The Solutions Log: A Manager’s System to Capture Impact (So My Reviews Are Easy)"
pubDate: "2025-10-23"
image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1472"
imageCredit: "Unsplash"
imageCreditUrl: "https://unsplash.com/photos/person-using-macbook-pro-npxXWgQ33ZQ"
category: "Engineering Management"
description: "Stop struggling with self-reviews. The Solutions Log is a lightweight Markdown system for engineering managers to capture impact in real time and nail every review."
---

If you’ve ever stared at an empty self‑review doc thinking “what did I actually do this year?”, you’re not alone. I was relying on memory (and scattered PRs/threads) to reconstruct impact across code and beyond code — incidents, cross‑team launches, coaching wins, process fixes, random notes in my journal. Recall was noisy, biased, and incomplete.

So I built a small, fast “solutions log” — a lightweight site where I capture the thing I did (or decided), the context, my actions, and the outcome. It’s become my source of truth for reviews and a running narrative of impact.

## What it is

- A tiny site with short, dated entries written in Markdown
- Each entry is a snapshot of “what I shipped, decided, or unblocked,” with context and outcome
- An index that lists everything in reverse‑chronological order
- Zero ceremony, optimized to be quick to write and easy to scan

## Why I made it

- Make reviews easy: Pull the last 6–12 months and I have instant bullets with links
- Reduce recall bias: Capture impact when it happens, not months later
- Show scope and leverage: Document work in and around code (people, process, product)
- Share upward and across: Link a single entry in weekly notes or status updates
- Build durable evidence: If it’s not written down, it didn’t happen (at review time)

## How it’s built (simple on purpose)

The structure is intentionally boring and file‑based:

- `content/` — Markdown entries like:
  - `2025-10-17-email-image-helper.md`
  - `2025-10-09-external-data-tables.md`
  - `2025-09-04-group-subs-accessibility-audit.md`
  - `2025-09-02-dismissable-callout-ab-testing.md`
- `layout.njk` — Base layout (header, footer, styles)
- `index.njk` — Lists recent entries with titles and dates
- `entry.njk` — Template for a single write‑up
- `assets/styles.css` — One stylesheet; readable by default
- `content/content.json` — Shared data/config

No client‑side framework, no heavy CMS. It’s quick to write, quick to deploy, and hard to break.

## The entry template I use

Each entry follows the same bones to keep it fast and useful later:

- Title — Descriptive “Reduced newsletter size by ensuring proper image sizes are used."
- Date — auto from filename
- Area — People / Process / Product / Platform (pick one)
- Problem — one sentence on what was broken or needed
- Context & constraints — the messy reality that shaped the work
- Actions — what I did (decisions, comms, code, coordination)
- Outcome & impact — metrics if possible; otherwise concrete before/after
- Evidence/links — PRs, docs, dashboards, Slack/Threads posts
- Follow‑ups — what’s next; debt intentionally left behind

Optional: tags for teams/systems to make later filtering easier.

## Recent examples (code and beyond code)

- Email image helper: consistent rendering across clients (code)
- Group subs accessibility audit: findings, fixes, and owner assignments (process + product)
- External data tables: perf decision, rollout plan, and guardrails (platform)
- On‑call process change that reduced MTTR by X% (people + process)
- Cross‑team launch — stakeholder alignment path and risk burndown (product)
- Coaching plan from 1:1s — growth goals, actions, and outcomes (people)
- Incident retro — action items tracked to completion (process)

None of these are moonshots — and that’s the point. The log captures the everyday managerial work that actually moves teams and products forward.

## A 10‑minute workflow

1) Create a new Markdown file in `content/` with the date and slug
2) Fill the template: Problem → Context → Actions → Outcome → Links (10–20 min)
3) Commit and push; the index updates automatically
4) Once a week, skim last entries and add tags or notes while it’s fresh

## Using it during review season

- Filter to the last half/quarter and copy bullets directly into the self‑review
- Group entries by themes (delivery, people leadership, quality, platform)
- Add a top summary paragraph using outcomes already captured
- Paste links as evidence; reviewers can audit quickly

## Steal this idea

If you lead teams or touch lots of surface area, a solutions log pays back quickly. It reduces repeated work, de‑stresses review season, and gives you a trustworthy trail of how and why decisions were made.

Small, boring systems often make the biggest impact. This one certainly has for me.

This same principle of documenting what works applies to personal life too. I've found [simple journaling prompts](/articles/2023-02-16-how-one-index-card-can-drastically-improve-your-journaling/) can be just as powerful for tracking life patterns and wins.
