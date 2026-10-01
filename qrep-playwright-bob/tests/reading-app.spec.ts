import { expect, test } from '@playwright/test';

test.describe('Reading App — Happy Paths', () => {
  test('root URL redirects to the first reflection with full metadata', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/read\/1$/);
    await expect(page).toHaveTitle(/The pause between things/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The pause between things');
    await expect(page.getByLabel('Choose a reflection').locator('option')).toHaveCount(10);
    await expect(page.getByRole('link', { name: /Next reflection/ })).toBeVisible();

    // Verify footer reflection counter
    await expect(page.locator('.page-footer')).toContainText('Page 01 of 10');
  });

  test('dropdown selector navigates to the selected reflection', async ({ page }) => {
    await page.goto('/read/1');
    await page.getByLabel('Choose a reflection').selectOption('5');

    await expect(page).toHaveURL(/\/read\/5$/);
    await expect(page).toHaveTitle(/The courage to be unfinished/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The courage to be unfinished');
    await expect(page.locator('.page-footer')).toContainText('Page 05 of 10');
  });

  test('next reflection link navigates sequentially and wraps around', async ({ page }) => {
    // Navigate from 1 to 2
    await page.goto('/read/1');
    await page.getByRole('link', { name: /Next reflection/ }).click();
    await expect(page).toHaveURL(/\/read\/2$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('A window is not the sky');

    // Wrap around from 10 to 1
    await page.goto('/read/10');
    await page.getByRole('link', { name: /Next reflection/ }).click();
    await expect(page).toHaveURL(/\/read\/1$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The pause between things');
  });

  test('header navigation and wordmark interactions', async ({ page }) => {
    await page.goto('/read/4');

    // Test header dropdown navigation
    await page.getByLabel('Go to page').selectOption('7');
    await expect(page).toHaveURL(/\/read\/7$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('A room for what is quiet');

    // Click wordmark to return to page 1
    await page.getByRole('link', { name: 'Still Becoming home' }).click();
    await expect(page).toHaveURL(/\/read\/1$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The pause between things');
  });

  test('spooky magic mode activates and resets automatically', async ({ page }) => {
    await page.goto('/read/1');
    const summonButton = page.getByRole('button', { name: /Summon a ghost/ });

    // Initial state
    await expect(summonButton).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('main.reading-page')).not.toHaveClass(/is-spooky/);

    // Trigger spooky state
    await summonButton.click();
    await expect(summonButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('main.reading-page')).toHaveClass(/is-spooky/);
    await expect(page.getByRole('status')).toHaveText('A quiet presence passed by.');

    // Auto-resets after 1.3s
    await expect(page.locator('main.reading-page')).not.toHaveClass(/is-spooky/, { timeout: 3000 });
  });

  test('all ten article routes render non-empty content and paragraphs', async ({ page }) => {
    for (const pageNumber of Array.from({ length: 10 }, (_, index) => index + 1)) {
      await page.goto(`/read/${pageNumber}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const paragraphCount = await page.locator('.article-copy p').count();
      expect(paragraphCount).toBeGreaterThan(0);
    }
  });

  test('mobile viewport drawer toggles and responsive layout does not overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/read/2');

    const exploreButton = page.getByRole('button', { name: /Explore/ });
    await expect(exploreButton).toHaveAttribute('aria-expanded', 'false');

    // Open mobile menu
    await exploreButton.click();
    await expect(exploreButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveClass(/is-open/);

    // Navigate within mobile menu
    await page.getByLabel('Go to page').selectOption('8');
    await expect(page).toHaveURL(/\/read\/8$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The shape of enough');

    // Verify zero horizontal scroll overflow
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});

test.describe('Reading App — Unhappy & Edge Cases', () => {
  test('out-of-range page numbers redirect safely to page 1', async ({ page }) => {
    const invalidNumbers = ['0', '11', '999', '-1', '-100'];

    for (const invalidPage of invalidNumbers) {
      await page.goto(`/read/${invalidPage}`);
      await expect(page).toHaveURL(/\/read\/1$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('The pause between things');
    }
  });

  test('non-numeric and malformed route parameters redirect to page 1', async ({ page }) => {
    const malformedRoutes = [
      '/read/abc',
      '/read/page-one',
      '/read/null',
      '/read/undefined',
      '/read/!@#$%',
    ];

    for (const route of malformedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/read\/1$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('The pause between things');
    }
  });

  test('completely undefined paths fallback to page 1', async ({ page }) => {
    await page.goto('/unknown/nested/route');
    await expect(page).toHaveURL(/\/read\/1$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The pause between things');
  });

  test('spooky mode handles multiple rapid clicks smoothly without crashing', async ({ page }) => {
    await page.goto('/read/1');
    const summonButton = page.getByRole('button', { name: /Summon a ghost/ });

    // Multi-click rapidly
    await summonButton.click();
    await summonButton.click();
    await summonButton.click();

    await expect(page.locator('main.reading-page')).toHaveClass(/is-spooky/);
    // Eventually cleans itself up
    await expect(page.locator('main.reading-page')).not.toHaveClass(/is-spooky/, { timeout: 3500 });
  });

  test('switching pages resets active spooky mode immediately', async ({ page }) => {
    await page.goto('/read/1');
    await page.getByRole('button', { name: /Summon a ghost/ }).click();
    await expect(page.locator('main.reading-page')).toHaveClass(/is-spooky/);

    // Switch page while spooky is active
    await page.getByRole('link', { name: /Next reflection/ }).click();
    await expect(page).toHaveURL(/\/read\/2$/);

    // Spooky class should be immediately removed upon navigation
    await expect(page.locator('main.reading-page')).not.toHaveClass(/is-spooky/);
  });
});
