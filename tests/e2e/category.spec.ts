import { test, expect } from '@playwright/test';

test('a category page lists only posts from that category', async ({ page }) => {
  await page.goto('/articles/');

  const categoryLink = page.locator('a[href^="/articles/category/"]').first();
  await expect(categoryLink).toBeVisible();
  const href = await categoryLink.getAttribute('href');
  const categoryText = (await categoryLink.textContent())!.trim();

  await categoryLink.click();
  await expect(page).toHaveURL(new RegExp(`${href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));

  // The page's own "<N> article(s)" summary should match the rendered card count.
  const summaryText = await page.locator('text=/\\d+ articles?/').first().textContent();
  const expectedCount = Number(summaryText!.match(/\d+/)![0]);
  const articles = page.locator('article');
  await expect(articles).toHaveCount(expectedCount);
  expect(expectedCount).toBeGreaterThan(0);

  // Every listed article should actually belong to this category (catches
  // the getStaticPaths/page-body double-filter this route does drifting).
  const categoryRegex = new RegExp(categoryText, 'i');
  const count = await articles.count();
  for (let i = 0; i < count; i++) {
    await expect(articles.nth(i)).toContainText(categoryRegex);
  }

  // Scoped to avoid colliding with h1s injected by Astro's dev toolbar.
  await expect(page.locator('.mb-12 h1')).toContainText(categoryRegex);
});

test('an unknown category slug is not a valid route', async ({ request }) => {
  const res = await request.get('/articles/category/definitely-not-a-real-category/');
  expect(res.status()).toBe(404);
});
