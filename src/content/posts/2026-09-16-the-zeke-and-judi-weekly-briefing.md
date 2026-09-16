---
title: "The Zeke & Judi Weekly Briefing"
subTitle: "Solving the part of our Sunday ritual we both dreaded"
pubDate: "2026-09-16"
category: "Ramblings"
image: "https://images.unsplash.com/photo-1632142334511-8f24c3d3ae79?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
imageCredit: "Jack Cole / Unsplash"
imageCreditUrl: "https://unsplash.com/photos/a-sandwich-in-a-metal-container-on-a-marble-table-J-Td0wZ_FgA"
tags: ["fatherhood", "family", "ai", "automation", "parenting"]
description: "How a Claude scheduled task now scrapes our school's lunch menu, flags the days Zeke needs a bagged lunch, and briefs my wife and me every Friday afternoon."
---

It's Sunday morning, sometime last year. My wife and I are at the kitchen table doing what we've started calling "the weekly." Coffee, a notepad, the calendar open on someone's phone. What's coming up this week. What's for dinner. What we need at the store.

And then, most weeks, the same line: "Ugh, do you remember the site with the lunch menu?"

We keep kosher. Zeke's school lunch only works on certain days — the days the menu actually lines up with what he can eat. The rest of the time, we're packing a bag. Which days are which lives on the NYC DOE website, a place that seems built to be forgotten and rediscovered every single Sunday.

Neither of us ever remembered the login. Neither of us ever bookmarked it in the right spot. We'd dig it up, squint at a grid of abbreviations, cross-reference it against what we already knew Zeke wouldn't touch, and write it on the list. Every week. Same friction. Same sigh.

[After I wrote about taming the school calendar chaos](/articles/2026-08-31-how-i-finally-tamed-the-school-calendar-chaos/), the four separate calendars — Zeke's school, his after-school program, Hebrew school, Judi's preschool — were finally merged into one shared "Z & J Mania" calendar. That problem was solved.

Solving it just made the next one more obvious. The calendar told us where the kids needed to be. It never told us what was for lunch.

This year, with school back in full swing and my own AI habits a lot more developed than they were six months ago, I noticed Claude had started offering scheduled tasks. I remember the exact moment — an idle afternoon, scrolling past the feature — and thinking: that's it, that's the lunch menu problem solved.

## What I built

Every Friday afternoon, a scheduled task runs. It:

- Scrapes the DOE site for Zeke's school lunch menu for the upcoming week
- Cross-references it against what he can actually eat
- Flags the specific days we need to pack a lunch instead
- Checks the Z & J Mania calendar and summarizes what's coming up for both kids in the week ahead

Then it emails the whole thing to my wife and me. Flagged lunch days and action items up top, the rest of the week underneath. It's sitting in both our inboxes before we even sit down for the weekly.

The weekly itself hasn't gone away. We still do coffee and the notepad Sunday morning. But the part that used to start with a sigh now starts with an email we've already read.

## The part I'm still working on

Kosher is a floor, not the whole answer. Zeke can eat grilled cheese. He just doesn't want to. A day where grilled cheese is on the menu still needs a bagged lunch, even though nothing about it breaks the rule we're actually working around.

Right now the briefing doesn't know that. It knows what he can eat, not what he'll eat. Some weeks it still gets corrected by hand.

The next version logs what Zeke actually likes and doesn't — not just what's permitted — so "he can eat it" and "he'll eat it" stop being two different questions I have to answer myself every Friday.

## If you want to try this

The setup is a Claude scheduled task, running weekly, with:

- A prompt describing the exact source (your school's lunch menu page or PDF) and what to check it against
- Access to your calendar, if you want it summarizing the week alongside the menu
- A firm instruction to flag conservatively — a menu it got wrong is worse than a menu it didn't check

Something close to what I'm running:

> Every Friday at 3pm, check [school]'s lunch menu for next week. Flag any day where [dietary constraint] means we need to pack a lunch instead. Then check the Z & J Mania calendar for anything coming up for Zeke or Judi in the next seven days. Email the flagged lunch days and the week's events to [wife] and me, flagged days first.

It won't be exactly right on the first pass. Mine still isn't. But it's already better than two adults trying to remember a website's login every Sunday morning.
