import { expect, test } from '@playwright/test';

const birthData = {
  name: 'Mobile Compacto',
  date: '1990-11-12',
  time: '10:30',
  location: 'Sao Paulo, SP, Brasil',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const planet = (id: string, name: string, symbol: string, longitude: number, sign: string, house: number) => ({
  id,
  name,
  symbol,
  longitude,
  latitude: 0,
  speed: 1,
  sign,
  degree: longitude % 30,
  house,
  retrograde: false,
});

const chart = {
  birthData,
  planets: [
    planet('sun', 'Sol', '*', 220, 'Escorpiao', 1),
    planet('moon', 'Lua', '*', 70, 'Gemeos', 2),
    planet('mercury', 'Mercurio', '*', 210, 'Escorpiao', 1),
    planet('venus', 'Venus', '*', 45, 'Touro', 7),
    planet('mars', 'Marte', '*', 125, 'Leao', 10),
    planet('jupiter', 'Jupiter', '*', 278, 'Capricornio', 3),
  ],
  housesPlacidus: Array.from({ length: 12 }, (_, index) => ({
    number: index + 1,
    longitude: index * 30,
    sign: 'Aries',
    degree: 0,
  })),
  housesWhole: Array.from({ length: 12 }, (_, index) => ({
    number: index + 1,
    longitude: index * 30,
    sign: 'Aries',
    degree: 0,
  })),
  aspects: [],
  ascendant: 0,
  mc: 90,
};

const savedChart = {
  id: 'mobile-compact-test',
  name: 'Mobile Compacto - 1990-11-12',
  birthData,
  chart,
  createdAt: '2026-04-26T12:00:00.000Z',
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((seed) => {
    window.localStorage.setItem('astromap_saved_charts', JSON.stringify([seed]));
  }, savedChart);

  await page.goto('/login');
  await page.getByRole('button', { name: /Ver Demonstração/i }).click();
  await page.waitForFunction(() => window.location.pathname === '/');
});

test('closes the mobile drawer after selecting a saved chart and keeps planets in two columns', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');

  await page.getByTitle('Menu').click();
  const closeButton = page.getByTitle('Fechar');
  const drawer = page.locator('div.fixed.inset-0.z-50');
  await expect(closeButton).toBeVisible();

  await drawer.getByRole('button', { name: /Mapas Salvos/i }).click();
  
  // Aguarda a lista renderizar e clica no primeiro mapa salvo (seja o do localStorage ou do Supabase)
  const firstSavedChart = drawer.getByRole('heading', { level: 4 }).first();
  await expect(firstSavedChart).toBeVisible();
  await firstSavedChart.click();

  await expect(closeButton).toBeHidden();
  
  // Aguarda o render dos cards de planetas para garantir que o mapa carregou
  const cards = page.getByTestId('planet-card');
  await expect(cards.first()).toBeVisible();
  await cards.first().scrollIntoViewIfNeeded();

  const firstCard = await cards.nth(0).boundingBox();
  const secondCard = await cards.nth(1).boundingBox();

  expect(firstCard).not.toBeNull();
  expect(secondCard).not.toBeNull();

  if (!firstCard || !secondCard) {
    throw new Error('Planet cards were not rendered.');
  }

  expect(Math.abs(firstCard.y - secondCard.y)).toBeLessThan(24);
  expect(Math.abs(firstCard.x - secondCard.x)).toBeGreaterThan(24);
});
