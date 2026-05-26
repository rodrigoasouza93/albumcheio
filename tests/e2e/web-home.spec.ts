import { expect, test } from '@playwright/test';

test('loads the initial web screen', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: 'Seu álbum de figurinhas sempre atualizado.'
    })
  ).toBeVisible();
  await expect(
    page.locator('form').getByRole('button', { name: 'Entrar' })
  ).toBeVisible();
});
