---
title: "Building a Paris Travel Site with AI in One Night"
pubDate: "2025-10-21"
image: "https://res.cloudinary.com/dt3vcpkj6/image/upload/v1761061487/paris-october-2025/20251013-DSC04348.jpg"
category: "Code"
description: "How I built a custom Paris travel website with GitHub Copilot in four hours — self-contained HTML pages, no build tools, 67 restaurant picks, and offline support."
---

For our 10-year wedding anniversary my wife and I took a trip to Paris and our usual Google Doc itinerary just wouldn't do anymore. 

Instead I wanted a custom travel website just for us. Not a generic itinerary app, but a personalized mobile site with our daily plans, restaurant recommendations, walking routes, and embedded maps we could access on the go.

With two kids, a full time job, and everything else going on in life I had no real time to do this myself. **Instead, I had about four hours on a weeknight.** No time for complex frameworks or build systems. So I partnered with GitHub Copilot to see how fast we could ship something real.

## The Approach: Keep It Simple

We made a key decision upfront: build everything as self-contained HTML files. No external CSS or JavaScript files. No npm packages. No build process. Just standalone pages with embedded styles and scripts that would work anywhere, even offline if we saved them locally.

This meant using vanilla JavaScript, CSS Grid and Flexbox for layouts, and CSS custom properties for theming. Old school, but fast and reliable.

The site needed four pages: a main itinerary with five days of activities, a recommendations page with 67 restaurants and shops organized by category, and two route pages for photo walks and morning runs.

## The Map Problem

The first challenge hit immediately: "The maps aren't loading."

I'd tried embedding Google Maps with an API key, but it was restricted and required billing setup. Not worth the hassle for a personal project.

We pivoted quickly. Instead of embedded iframes, we used simple Google Maps search URLs. Each location became a button that opens directly in the Google Maps app on mobile. No API key needed, better UX, zero cost.

For the walking and running routes, we kept Leaflet.js with OpenStreetMap tiles. It's free, lightweight, and perfect for visualizing paths with waypoints.

## Designing Through Iteration

The fun part was iterating on the design in real-time. I'd ask for changes, see them implemented in seconds, then refine.

"Let's update the header and add a footer."  
Boom. Sticky header with blur effect, consistent navigation, copyright footer.

"Can we add a baguette icon for branding?"  
Custom SVG appears across all four pages.

"Actually, change it to an Eiffel Tower."  
New SVG, bronze and gold colors.

"You know what? Let's just use emojis: 🥐 🇫🇷 🥖"  
Perfect. Sometimes simpler really is better.

## What We Shipped

In about four hours, we built:
- **4 pages** with consistent design and navigation
- **67 location buttons** with direct Google Maps links
- **Interactive accordions** for daily itineraries (only one open at a time to save screen space)
- **Responsive layouts** that work beautifully on mobile
- **Custom walking and running routes** with map visualizations
- **Fast loading** (<1 second) with no build step

The entire site is ~945 lines of code, loads instantly, and works perfectly on our phones.

## Lessons Learned

**1. You don't need complex tools for simple projects.** Plain HTML, CSS, and JavaScript got us 95% of the way there.

**2. Constraints breed creativity.** The Google Maps API restriction forced us to find a better solution.

**3. Iteration is everything.** We went through three icon designs in ten minutes. Without fast feedback loops, we'd have been stuck with version one.

**4. AI collaboration works when you're specific.** "Make it look better" doesn't work. "Add a sticky header with backdrop blur and consistent navigation buttons" does.

**5. Ship it.** Perfect is the enemy of done. We have a working travel site deployed to GitHub Pages, ready to use in Paris this week.

The best part? My wife loved it. Not because it's technically impressive, but because it's ours—custom-built for our trip, with our plans, our restaurants, our routes.

Sometimes the best code isn't the most clever. It's the code that ships and solves a real problem.

---

*P.S. — The website is [live](https://reubeningber.github.io/paris-anniversary/). Four pages of maps, routes, and recommendations. All coded between 10 PM and midnight over a few weeks. Would I do it again? Absolutely. Did she use it? Obviously. Worth it.*