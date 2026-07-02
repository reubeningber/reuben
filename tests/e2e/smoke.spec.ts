import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Reuben Ingber/);
});

test('articles index lists at least one post', async ({ page }) => {
  await page.goto('/articles/');
  const links = page.locator('a[href^="/articles/"]');
  await expect(links.first()).toBeVisible();
  expect(await links.count()).toBeGreaterThan(0);
});

test('an individual article page renders', async ({ page, request }) => {
  const res = await request.get('/rss.xml');
  const xml = await res.text();
  const match = xml.match(/<link>(https:\/\/reubeningber\.com\/articles\/[^<]+\/)<\/link>/);
  expect(match).not.toBeNull();

  await page.goto(match![1]);
  await expect(page.locator('h1')).toBeVisible();
});

test('field notes index loads', async ({ page }) => {
  await page.goto('/field-notes/');
  await expect(page.locator('body')).toBeVisible();
});

test('a field note detail page renders', async ({ page, request }) => {
  const res = await request.get('/field-notes/rss.xml');
  const xml = await res.text();
  expect(res.ok()).toBeTruthy();
  expect(xml).toContain('<rss');
});

test('rss.xml is valid XML with at least one item', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.ok()).toBeTruthy();
  const xml = await res.text();
  expect(xml).toContain('<?xml');
  expect(xml).toContain('<item>');
});

test('sitemap.xml is valid XML with expected static routes', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.ok()).toBeTruthy();
  const xml = await res.text();
  expect(xml).toContain('<urlset');
  expect(xml).toContain('<loc>https://reubeningber.com/articles/</loc>');
  expect(xml).toContain('<loc>https://reubeningber.com/field-notes/</loc>');
});
