import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Ver Demonstração/i }).click();
  await page.waitForFunction(() => window.location.pathname === '/');
});

test('loads the authenticated home page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/AstroMap/);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('img', { name: /AstroMap Logo/i })).toBeVisible();
});

test('shows the birth data form controls', async ({ page }) => {
  await page.goto('/');

  const bodyContent = await page.locator('body').innerText();
  console.log('Body Content:', bodyContent);
  await expect(page.locator('#birthName')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#birthDate')).toBeVisible();
  await expect(page.locator('#birthTime')).toBeVisible();
  await expect(page.locator('#birthLocation')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pesquisar local' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Calcular Mapa Astral/i })).toBeDisabled();
});
