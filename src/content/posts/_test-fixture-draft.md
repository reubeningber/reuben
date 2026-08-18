---
title: Test Fixture — Draft Post (do not publish)
pubDate: 2020-01-01
draft: true
---

This post exists only so e2e tests (tests/e2e/feeds.spec.ts) have a stable,
committed draft post to check against. Real drafts live outside git (see
.gitignore), so relying on one of those would break in CI. Keep `draft: true`
and don't delete this file — mirrors src/content/field-notes/_template.md.
