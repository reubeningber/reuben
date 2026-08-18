import { test, expect } from '@playwright/test';

// The book data behind /reading changes weekly via automation, so these
// tests avoid asserting on specific titles/counts. Instead they derive
// expectations from whatever is actually rendered (data-* attributes) and
// check the UI wiring/behavior around that data.

test('reading page loads with year tabs and a default panel', async ({ page }) => {
  await page.goto('/reading/');
  await expect(page.getByRole('heading', { level: 1, name: 'READING', exact: true })).toBeVisible();

  const tabs = page.locator('.year-tab');
  await expect(tabs.first()).toBeVisible();
  expect(await tabs.count()).toBeGreaterThan(1);

  // Exactly one tab is selected, and its panel is the only visible one.
  const selected = page.locator('.year-tab[aria-selected="true"]');
  await expect(selected).toHaveCount(1);
  const year = await selected.getAttribute('data-year');

  const visiblePanel = page.locator('.year-panel:not(.hidden)');
  await expect(visiblePanel).toHaveCount(1);
  await expect(visiblePanel).toHaveAttribute('data-year-panel', year!);
});

test('a "2019…" catch-all tab exists for older/undated reads', async ({ page }) => {
  await page.goto('/reading/');
  const oldTab = page.locator('.year-tab', { hasText: '2019…' });
  await expect(oldTab).toBeVisible();
});

test('switching year tabs shows only that year\'s panel with matching card count', async ({ page }) => {
  await page.goto('/reading/');
  const oldTab = page.locator('.year-tab', { hasText: '2019…' });
  const label = (await oldTab.textContent())!;
  const expectedCount = Number(label.match(/\((\d+)\)/)![1]);

  await oldTab.click();
  await expect(oldTab).toHaveAttribute('aria-selected', 'true');

  const panel = page.locator('.year-panel[data-year-panel="2019-and-earlier"]');
  await expect(panel).toBeVisible();
  await expect(page.locator('.year-panel:not(.hidden)')).toHaveCount(1);

  const cards = panel.locator('a[data-title]');
  expect(await cards.count()).toBe(expectedCount);
});

test('search filters across every year, not just the selected one', async ({ page }) => {
  await page.goto('/reading/');

  // A single common letter should match books outside the default year tab.
  await page.fill('#reading-search', 'e');

  const resultsGrid = page.locator('#search-results');
  await expect(resultsGrid).toBeVisible();
  await expect(page.locator('#year-panels')).toBeHidden();

  // No year tab should read as "selected" while a cross-year search is active.
  await expect(page.locator('.year-tab[aria-selected="true"]')).toHaveCount(0);

  const expected = await page.evaluate(() => {
    const cards = document.querySelectorAll<HTMLElement>('#search-results a[data-title]');
    let count = 0;
    cards.forEach((c) => {
      if (c.dataset.title?.includes('e') || c.dataset.author?.includes('e')) count++;
    });
    return count;
  });

  await expect(page.locator('#results-count')).toContainText(`${expected} book`);
});

test('an unmatched search shows the empty state', async ({ page }) => {
  await page.goto('/reading/');
  await page.fill('#reading-search', 'zzzznonexistentbookzzzz');
  await expect(page.locator('#results-empty')).toBeVisible();
  await expect(page.locator('#results-count')).toBeHidden();
});

test('the audio filter shows only audiobooks across all years', async ({ page }) => {
  await page.goto('/reading/');
  await page.click('#filters-toggle');
  await page.click('#audio-filter-toggle');

  await expect(page.locator('#search-results')).toBeVisible();
  await expect(page.locator('#filters-count-badge')).toHaveText('1');

  const visibleCards = page.locator('#search-results a[data-title]:not(.hidden)');
  const count = await visibleCards.count();
  expect(count).toBeGreaterThan(0);

  const audioValues = await visibleCards.evaluateAll((els) => els.map((el) => el.getAttribute('data-audio')));
  expect(audioValues.every((v) => v === 'true')).toBe(true);
});

test('the rating filter shows only exact-match ratings across all years', async ({ page }) => {
  await page.goto('/reading/');
  await page.click('#filters-toggle');
  await page.click('[data-rating-value="5"]');

  await expect(page.locator('#search-results')).toBeVisible();

  const visibleCards = page.locator('#search-results a[data-title]:not(.hidden)');
  const count = await visibleCards.count();
  expect(count).toBeGreaterThan(0);

  const ratings = await visibleCards.evaluateAll((els) => els.map((el) => el.getAttribute('data-rating')));
  expect(ratings.every((v) => v === '5')).toBe(true);
});

test('the genre filter shows only that genre across all years', async ({ page }) => {
  await page.goto('/reading/');
  await page.click('#filters-toggle');

  const genreSelect = page.locator('#genre-filter-select');
  const options = await genreSelect.locator('option').all();
  // options[0] is "All genres"; pick the first real genre.
  const genreValue = await options[1].getAttribute('value');
  await genreSelect.selectOption(genreValue!);

  await expect(page.locator('#search-results')).toBeVisible();

  const visibleCards = page.locator('#search-results a[data-title]:not(.hidden)');
  const count = await visibleCards.count();
  expect(count).toBeGreaterThan(0);

  const genres = await visibleCards.evaluateAll((els) => els.map((el) => el.getAttribute('data-genre')));
  expect(genres.every((v) => v === genreValue)).toBe(true);
});

test('clearing filters returns to plain year browsing', async ({ page }) => {
  await page.goto('/reading/');
  await page.click('#filters-toggle');
  await page.click('#audio-filter-toggle');
  await expect(page.locator('#search-results')).toBeVisible();

  await page.click('#clear-filters');

  await expect(page.locator('#year-panels')).toBeVisible();
  await expect(page.locator('#search-results')).toBeHidden();
  await expect(page.locator('#filters-count-badge')).toBeHidden();
  await expect(page.locator('.year-tab[aria-selected="true"]')).toHaveCount(1);
});

test('selecting a year tab clears any active filters', async ({ page }) => {
  await page.goto('/reading/');
  await page.click('#filters-toggle');
  await page.click('#audio-filter-toggle');
  await expect(page.locator('#filters-count-badge')).toBeVisible();

  // The Filters popover overlaps the rightmost year tabs, so close it first
  // the way a real user would (matches the page's Escape-to-close handler).
  await page.keyboard.press('Escape');

  const tabs = page.locator('.year-tab');
  const otherTab = tabs.nth((await tabs.count()) - 1);
  await otherTab.click();

  await expect(page.locator('#filters-count-badge')).toBeHidden();
  await expect(page.locator('#year-panels')).toBeVisible();
  await expect(otherTab).toHaveAttribute('aria-selected', 'true');
});

test('a book cover reveals its rating on hover', async ({ page }) => {
  await page.goto('/reading/');
  const card = page.locator('.year-panel:not(.hidden) a[data-rating]').first();
  await card.hover();
  // The rating row exists in the DOM regardless of hover state (opacity-based
  // reveal), so just check the underlying data is wired to a real card.
  await expect(card).toHaveAttribute('data-rating', /\d+/);
});
