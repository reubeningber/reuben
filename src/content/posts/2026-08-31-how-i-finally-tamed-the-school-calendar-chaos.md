---
title: "How I Finally Tamed the School Calendar Chaos"
subTitle: "Two kids, four calendars, one PDF at a time"
pubDate: "2026-08-31"
category: "Ramblings"
image: "https://res.cloudinary.com/dt3vcpkj6/image/upload/[REPLACE_WITH_IMAGE_PATH]"
tags: ["fatherhood", "parenting", "ai", "family", "productivity"]
description: "I used Claude to turn four different school PDFs into one shared family calendar. Here's exactly how, with the prompts I used."
---

Late August. I've got four PDFs open in four tabs — Zeke's DOE calendar, his after-school program, his Hebrew school, and Judi's preschool. Every one of them formatted differently. Every one of them a wall of dates I need to somehow get into my head, and more importantly, onto a calendar my wife and I actually share.

I used to do this by hand. Squint at a grid, cross-reference against another grid, type it in, get something wrong, find out in October when a kid shows up to a building that's closed.

This year I didn't do any of that. I handed the PDFs to Claude instead.

---

Somewhere online, under a post like this one, someone always says it: why not just hang the calendars on the fridge?

Because I've got four calendars, not one. A fridge doesn't help me when I'm at the grocery store and a friend asks if the kids want to hang out, and what I actually need in that moment is to know that on the second Sunday in October, Zeke has Hebrew school and Judi has soccer. For better or worse, a family runs on its calendar now. Mine needed to live in my pocket, merged, not scattered across four pieces of paper stuck to an appliance.

**The setup.** We have one shared Google calendar — "Z & J Mania" — that both of us check. The calendar itself was the easy part. What took real effort was cramming a year of scattered, differently-formatted school dates into it without losing an afternoon.

Here's roughly what I did, in order:

> "Here's a link to the NYC DOE calendar. Review it and come up with a list of dates relevant to a parent of a kid going into 2nd grade. Be conservative about what you flag."

That last line matters. Left alone, it'll flag everything — every clerical day, every conference week. Telling it to be conservative kept the first pass usable instead of a wall of noise I'd have to prune myself.

Once I had a list I liked:

> "Add these to the ZJ Mania calendar as all-day events. If school is closed, title it 'Z - No School (Reason)'."

Same move for Judi's preschool calendar, then Zeke's after-school program, then Zeke's Hebrew school — one PDF at a time, one review-then-approve loop each time. I never let it write to the calendar without showing me the list first. A wrong entry on a shared calendar is worse than no entry at all.

The naming convention did more work than I expected. Every event starts with "Z -" or "J -" so at a glance either of us knows which kid, without opening it. When something applied to both — a citywide holiday, a Jewish holiday both schools observe — I had it go back through afterward and merge the duplicate entries into a single "Z/J -" event.

That last part was its own pass, days later:

> "Review the calendar from now through June. Find events that could be combined — like Yom Kippur, where we've got separate Z and J entries for the same closure. Also flag anything that's now a duplicate."

It came back with exactly that: a list of mergeable pairs, and a separate list of things that looked like duplicates but weren't — one kid's "early pickup" wasn't the same time as the other's, so those stayed apart. I don't think I'd have caught that distinction if I'd just eyeballed a year of dates myself.

---

What actually saved the time wasn't the calendar-writing. It was the reading. A PDF with a Sunday-school schedule and a list of Jewish holidays, cross-referenced against which of those Sundays fall inside a break week — that's the kind of thing I'd get half right at 11pm and not notice until a kid was standing outside a locked building.

I still made the calls. Which category a date belonged in, whether an ambiguous "break" week counted as closed, which of two "last day" dates applied to my 3-year-old. That part's still on me. It just didn't take all afternoon anymore.

---

**If you want to try this.** Two things you need first. One, connect Claude to your Google Calendar — in Claude's settings, under connectors, add Google Calendar and authorize it. Once it's connected, Claude can read and write events directly instead of you copy-pasting dates by hand. Two, have your kid's school calendar as a PDF or a link.

Then something like this, filled in for your own family:

> "Here's a link to [SCHOOL NAME]'s calendar for the [YEAR] school year: [LINK OR UPLOAD THE PDF]. My kid is going into [GRADE]. Review it and come up with a conservative list of dates I actually need to know about — closures, half days, first/last day of school, anything unusual. Don't include anything routine like a normal Tuesday. Give me the list first so I can approve it before you add anything."

Once you've looked it over:

> "Add these to my [CALENDAR NAME] calendar as all-day events. Use [KID INITIAL] - [Description] as the title, and for anything the school is closed, use [KID INITIAL] - No School ([Reason])."

If more than one kid's calendar ends up in the same place, that last step is worth repeating for each kid, then asking Claude to do one more pass:

> "Look at everything on the calendar between now and [END DATE]. Find any events for different kids that are actually the same closure, and suggest combining them. Also flag anything that looks like a duplicate."

That's it. The prompts do the tedious part. You still have to be the one who knows your kid isn't in extended care yet, or that the "break" week everyone's calling closed actually isn't for your specific program. No PDF replaces that. It just stops eating your Sunday night.
