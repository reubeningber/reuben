import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } });

test('the mobile nav drawer opens, closes on Escape, and returns focus', async ({ page }) => {
  await page.goto('/');

  const toggle = page.locator('#menu-toggle');
  const drawer = page.locator('#mobile-drawer');

  await expect(toggle).toBeVisible();
  await expect(drawer).toHaveClass(/-translate-x-full/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await toggle.click();
  await expect(drawer).not.toHaveClass(/-translate-x-full/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(drawer.locator('a[href="/articles/"]')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(drawer).toHaveClass(/-translate-x-full/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('the mobile nav drawer closes via its close button', async ({ page }) => {
  await page.goto('/');
  await page.locator('#menu-toggle').click();
  await expect(page.locator('#mobile-drawer')).not.toHaveClass(/-translate-x-full/);

  await page.locator('#menu-close').click();
  await expect(page.locator('#mobile-drawer')).toHaveClass(/-translate-x-full/);
});

test('the desktop nav is hidden and the hamburger is shown on mobile viewports', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#menu-toggle')).toBeVisible();
});
