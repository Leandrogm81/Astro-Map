import { expect, test } from '@playwright/test';

const birthData = {
  name: 'Mobile Test',
  date: '1990-11-12',
  time: '10:30',
  location: 'Sao Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const planet = (id: string, name: string, longitude: number, sign: string) => ({
  id,
  name,
  symbol: '*',
  longitude,
  latitude: 0,
  speed: 1,
  sign,
  degree: longitude % 30,
  house: 1,
  retrograde: false,
});

const chart = {
  birthData,
  planets: [
    planet('sun', 'Sol', 220, 'Escorpiao'),
    planet('moon', 'Lua', 70, 'Gemeos'),
    planet('mercury', 'Mercurio', 210, 'Escorpiao'),
    planet('venus', 'Venus', 45, 'Touro'),
  ],
  housesPlacidus: Array.from({ length: 12 }, (_, index) => ({
    number: index + 1,
    longitude: index * 30,
    sign: 'Aries',
    degree: 0,
  })),
  housesWhole: [],
  aspects: [],
  ascendant: 0,
  mc: 90,
};

const savedChart = {
  id: 'mobile-dashboard-test',
  name: 'Mobile Test - 1990-11-12',
  birthData,
  chart,
  createdAt: '2026-04-26T12:00:00.000Z',
  solarRevolution: chart,
  solarYear: 2026,
};

test.beforeEach(async ({ context, page }) => {
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

  await page.addInitScript((seed) => {
    window.localStorage.setItem('astromap_saved_charts', JSON.stringify([seed]));
  }, savedChart);
});

test('does not show the mobile dashboard on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: /Mapas Salvos/i }).click();
  await page.getByText('Mobile Test - 1990-11-12').click();

  await expect(page.getByTestId('mobile-dashboard')).toBeHidden();
});

test('shows the mobile dashboard on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  const drawer = page.locator('.fixed.inset-0.z-50');
  await drawer.getByRole('button', { name: /Mapas Salvos/i }).click();
  await drawer.getByText('Mobile Test - 1990-11-12').click();

  await expect(page.getByTestId('mobile-dashboard')).toBeVisible();
  await expect(page.getByText('Dashboard Astrologico')).toBeVisible();
});
