import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Finds a slideshow-type field note from real content rather than
// hardcoding a slug, so this keeps working as content changes.
const NOTES_DIR = path.join(process.cwd(), 'src/content/field-notes');

function frontmatter(filePath: string): string {
  const raw = readFileSync(filePath, 'utf-8');
  return raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
}

function isSlideshow(fm: string): boolean {
  return /^type:\s*slideshow\s*$/m.test(fm);
}

function isDraft(fm: string): boolean {
  return /^draft:\s*true\s*$/m.test(fm);
}

function imageCount(fm: string): number {
  return (fm.match(/^\s+-\s+\S+/gm) ?? []).length;
}

const slideshowFile = readdirSync(NOTES_DIR)
  .filter((f) => f.endsWith('.md') && f !== '_template.md')
  .find((f) => {
    const fm = frontmatter(path.join(NOTES_DIR, f));
    return isSlideshow(fm) && !isDraft(fm) && imageCount(fm) > 1;
  });

test.skip(!slideshowFile, 'no published multi-image slideshow field note found in content');

const slug = slideshowFile?.replace(/\.md$/, '');

test('slideshow next/prev buttons and dots update the active slide', async ({ page }) => {
  await page.goto(`/field-notes/${slug}/`);

  const slideshow = page.locator('.fn-slideshow');
  await expect(slideshow).toBeVisible();

  const counter = page.locator('.fn-slideshow-current');
  await expect(counter).toHaveText('1');

  await page.locator('.fn-slideshow-next').click();
  await expect(counter).toHaveText('2');

  await page.locator('.fn-slideshow-prev').click();
  await expect(counter).toHaveText('1');

  // Clicking the third dot should jump directly to slide 3.
  await page.locator('.fn-slideshow-dot').nth(2).click();
  await expect(counter).toHaveText('3');
});

test('slideshow wraps around when navigating past the first/last slide', async ({ page }) => {
  await page.goto(`/field-notes/${slug}/`);

  const counter = page.locator('.fn-slideshow-current');
  const total = Number(await page.locator('.fn-slideshow-counter').textContent().then((t) => t!.split('/')[1].trim()));

  await page.locator('.fn-slideshow-prev').click(); // from slide 1, prev should wrap to the last slide
  await expect(counter).toHaveText(String(total));

  await page.locator('.fn-slideshow-next').click(); // back to slide 1
  await expect(counter).toHaveText('1');
});

test('slideshow responds to arrow keys when focused', async ({ page }) => {
  await page.goto(`/field-notes/${slug}/`);

  const slideshow = page.locator('.fn-slideshow');
  const counter = page.locator('.fn-slideshow-current');

  await slideshow.focus();
  await page.keyboard.press('ArrowRight');
  await expect(counter).toHaveText('2');

  await page.keyboard.press('ArrowLeft');
  await expect(counter).toHaveText('1');
});
