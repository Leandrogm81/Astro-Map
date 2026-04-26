import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: 'astromap_session',
      value: 'authenticated',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
});

test('loads the authenticated home page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/AstroMap/);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('img', { name: /AstroMap Logo/i })).toBeVisible();
});

test('shows the birth data form controls', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#birthName')).toBeVisible();
  await expect(page.locator('#birthDate')).toBeVisible();
  await expect(page.locator('#birthTime')).toBeVisible();
  await expect(page.locator('#birthLocation')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pesquisar local' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Calcular Mapa Astral/i })).toBeDisabled();
});
