import { expect, test } from '@playwright/test';

test('loads the initial web screen', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'AlbumCheio' })).toBeVisible();
  await expect(page.getByText('Gestão de álbuns de figurinhas')).toBeVisible();
});
