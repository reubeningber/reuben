---
title: I Made a Knicks Shirt Generator Because Taylor Swift Wore One at the NBA Finals
subTitle: A one-day build while the moment was still alive.
pubDate: 2026-06-12
updatedDate: 2026-06-12
draft: false
category: Code
tags:
  - projects
description: Taylor Swift wore a "STEVIE KNICKS" shirt to Game 4 of the NBA
  Finals and I built a free browser tool to let anyone make their own version —
  same arched orange lettering, instant PNG download, shipped same day.
image: https://reubeningber.github.io/knicks-shirt-maker/og-image.png
---
Yesterday Taylor Swift showed up to Game 4 of the 2026 NBA Finals at Madison Square Garden in a custom Knicks blue t-shirt with orange block lettering that said "STEVIE KNICKS." It blew up instantly. My feed was wall-to-wall.
My first thought was: I want one. My second thought was: I could probably build that.
So I did. Knicks Shirt Maker is a free, browser-based tool where you type any text and it renders live on a Knicks blue t-shirt with arched orange lettering in the same style as the viral shirt. Download it as a PNG. Done.
I shipped it the same day.

The part that was actually interesting
Most of this was pretty straightforward — Canvas API, some CSS, the Graduate font from Google Fonts for that jersey-collegiate feel. The piece that took real thought was the arched text.
The obvious approach is to rotate each letter individually along an arc. That's how most people would do it. The problem is it makes the spacing look wrong — narrow letters like "I" end up with weirdly inconsistent gaps and the whole thing feels off.
The fix: render the full word to a hidden offscreen canvas first, letting the browser handle kerning naturally, then warp it column-by-column using a parabolic formula. Each vertical slice of the text shifts down based on how far it is from the center. The arch is smooth, the letter spacing is preserved, and it looks like it came off an actual jersey.
It's a small thing but it's the difference between "kind of works" and "actually looks right."

Some other stuff I snuck in
There's a magic hat button that generates random Knicks pun names — 49 of them, things like "Knickelback," "Knicki Minaj," "Knick Jagger," "Dominicknicks." Half the fun of building it was writing those.
There's also a New York Groove easter egg that plays on first interaction. Because of course there is.
The whole thing is pure HTML, CSS, and vanilla JavaScript. No frameworks, no build step, no dependencies. Hosted on GitHub Pages. It costs me nothing to run.

I don't know how long this moment lasts. The Finals will be over soon and the internet will move on. But it was a good excuse to build something fast and ship it while it was still relevant — which, honestly, is a skill I don't exercise enough.
Go make your shirt: reubeningber.github.io/knicks-shirt-maker