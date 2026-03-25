import { expect, test } from '@playwright/test';

test.describe('authenticated momentum smoke', () => {
  test('loads key app surfaces and same-origin social hub route', async ({ page, request }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('momentum_session_user_id', 'u3');
      window.localStorage.setItem('momentum_active_company', 'c1');
    });

    await page.goto('/');
    await page.getByRole('button', { name: /WAMOCON Academy/i }).click();
    await page.waitForURL(/\/project\/c1/);
    await expect(page.getByRole('heading', { name: /Dashboard|Übersicht/i })).toBeVisible();

    await page.goto('/project/c1/content');
    await expect(page.getByRole('heading', { name: /Content-Kalender|Content calendar/i })).toBeVisible();
    await page.getByRole('button', { name: /Liste|List/i }).click();
    await page.getByRole('cell', { name: 'LinkedIn: B2B Case Study' }).click();
    await expect(page.getByText(/Verknüpfte Social Hub Posts|Verknuepfte Social Hub Posts/i)).toBeVisible();

    await page.goto('/project/c1/tasks');
    await expect(page.getByRole('heading', { name: /Globale Aufgaben & Creatives/i })).toBeVisible();

    await expect.poll(async () => {
      const response = await request.get('/social-hub/projects');
      return response.status();
    }).toBe(200);

    await page.goto('/project/c1/social-hub');
    await expect(page.getByRole('heading', { name: /Social Hub/i })).toBeVisible();
    await expect(page.getByText(/Social Hub Connected|Social Hub verbunden|Social Hub Offline|Social Hub offline/i)).toBeVisible();
  });
});