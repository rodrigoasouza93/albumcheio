import { expect, test, type Page, type Route } from '@playwright/test';

const timestamp = '2026-05-25T10:00:00.000Z';
const user = {
  id: 'user-id',
  name: 'Rodrigo',
  email: 'collector@example.com',
  createdAt: timestamp,
  updatedAt: timestamp
};
const session = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
  tokenType: 'bearer',
  user
};
const album = {
  id: 'album-id',
  name: 'Copa do Mundo 2026',
  edition: 'Panini',
  description: 'Álbum principal do torneio',
  status: 'draft',
  createdBy: user.id,
  createdAt: timestamp,
  updatedAt: timestamp
};
const createdAlbum = {
  ...album,
  id: 'created-album-id',
  name: 'Copa América 2026',
  description: 'Catálogo criado no E2E'
};
const section = {
  id: 'section-id',
  albumId: album.id,
  name: 'Brasil',
  code: 'BRA',
  kind: 'team',
  sortOrder: 10,
  createdAt: timestamp,
  updatedAt: timestamp
} as const;
const firstSticker = {
  id: 'sticker-owned',
  albumId: album.id,
  sectionId: section.id,
  code: 'BRA01',
  number: 1,
  title: 'Escudo do Brasil',
  sortOrder: 10,
  createdAt: timestamp,
  updatedAt: timestamp
};
const secondSticker = {
  id: 'sticker-missing',
  albumId: album.id,
  sectionId: section.id,
  code: 'BRA02',
  number: 2,
  title: 'Camisa reserva',
  sortOrder: 20,
  createdAt: timestamp,
  updatedAt: timestamp
};
const createdSticker = {
  ...firstSticker,
  id: 'created-sticker-id',
  code: 'ARG01',
  title: 'Escudo da Argentina',
  sortOrder: 30
};
const createdSection = {
  ...section,
  id: 'created-section-id',
  code: 'ARG',
  name: 'Argentina',
  sortOrder: 20
};

const fulfillJson = async (route: Route, body: unknown, status = 200) => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body)
  });
};

const mockApi = async (page: Page) => {
  const quantities = new Map<string, number>([
    [firstSticker.id, 2],
    [secondSticker.id, 0]
  ]);

  await page.route('http://localhost:3001/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api/v1', '');

    if (path === '/auth/register' && request.method() === 'POST') {
      await fulfillJson(route, {
        user,
        session: {
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresIn: session.expiresIn,
          tokenType: session.tokenType
        }
      });
      return;
    }

    if (path === '/auth/login' && request.method() === 'POST') {
      await fulfillJson(route, {
        user,
        session: {
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresIn: session.expiresIn,
          tokenType: session.tokenType
        }
      });
      return;
    }

    if (path === '/me') {
      await fulfillJson(route, user);
      return;
    }

    if (path === '/albums' && request.method() === 'GET') {
      await fulfillJson(route, { items: [album], limit: 50, offset: 0 });
      return;
    }

    if (path === '/albums' && request.method() === 'POST') {
      await fulfillJson(route, createdAlbum);
      return;
    }

    if (path === `/albums/${album.id}`) {
      await fulfillJson(route, { ...album, sections: [section] });
      return;
    }

    if (path === `/albums/${album.id}/sections`) {
      await fulfillJson(route, createdSection);
      return;
    }

    if (path === `/albums/${album.id}/stickers` && request.method() === 'GET') {
      await fulfillJson(route, {
        items: [firstSticker, secondSticker],
        limit: 100,
        offset: 0
      });
      return;
    }

    if (path === `/albums/${album.id}/stickers` && request.method() === 'POST') {
      await fulfillJson(route, createdSticker);
      return;
    }

    if (path === `/albums/${album.id}/collection/search`) {
      const code = url.searchParams.get('code')?.toUpperCase();
      const sticker = code === secondSticker.code ? secondSticker : firstSticker;
      const quantityTotal = quantities.get(sticker.id) ?? 0;
      const duplicateCount = Math.max(quantityTotal - 1, 0);

      await fulfillJson(route, {
        albumId: album.id,
        code: code ?? sticker.code,
        status:
          quantityTotal === 0
            ? 'missing'
            : duplicateCount > 0
              ? 'duplicate'
              : 'owned',
        sticker,
        quantityTotal,
        owned: quantityTotal > 0,
        duplicateCount
      });
      return;
    }

    if (path === `/collection-items/${secondSticker.id}`) {
      quantities.set(secondSticker.id, 1);
      await fulfillJson(route, {
        id: 'collection-item-id',
        userId: user.id,
        stickerId: secondSticker.id,
        quantityTotal: 1,
        owned: true,
        duplicateCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      return;
    }

    if (path === `/albums/${album.id}/progress`) {
      const owned = [...quantities.values()].filter((quantity) => quantity > 0)
        .length;

      await fulfillJson(route, {
        albumId: album.id,
        total: 2,
        owned,
        missing: 2 - owned,
        percentage: owned * 50,
        sections: [
          {
            sectionId: section.id,
            sectionCode: section.code,
            sectionName: section.name,
            total: 2,
            owned,
            missing: 2 - owned,
            percentage: owned * 50
          }
        ]
      });
      return;
    }

    if (path === `/albums/${album.id}/missing`) {
      await fulfillJson(route, {
        items: quantities.get(secondSticker.id) === 0 ? [secondSticker] : [],
        limit: 100,
        offset: 0
      });
      return;
    }

    if (path === `/albums/${album.id}/duplicates`) {
      await fulfillJson(route, {
        items: [
          {
            ...firstSticker,
            quantityTotal: quantities.get(firstSticker.id) ?? 0,
            duplicateCount: 1
          }
        ],
        limit: 100,
        offset: 0
      });
      return;
    }

    await fulfillJson(route, { message: 'Not found' }, 404);
  });
};

const saveSession = async (page: Page) => {
  await page.addInitScript((storedSession) => {
    window.localStorage.setItem(
      'albumcheio.session',
      JSON.stringify(storedSession)
    );
  }, session);
};

test('registers, logs in, and creates a basic album catalog', async ({
  page
}) => {
  await mockApi(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Criar conta' }).click();
  await page.getByLabel('Nome').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Senha').fill('12345678');
  await page.locator('form').getByRole('button', { name: 'Criar conta' }).click();

  await expect(
    page.getByRole('heading', { name: 'Álbuns cadastrados' })
  ).toBeVisible();
  await expect(page.getByText(album.name).first()).toBeVisible();

  await page.getByLabel('Nome do álbum').fill(createdAlbum.name);
  await page.getByLabel('Edição').fill(createdAlbum.edition);
  await page.getByLabel('Descrição').fill(createdAlbum.description);
  await page.getByRole('button', { name: 'Criar álbum' }).click();

  await expect(page.getByText(`${createdAlbum.name} foi criado.`)).toBeVisible();
});

test('creates section and sticker, marks possession, searches, and shows progress', async ({
  page
}) => {
  await mockApi(page);
  await saveSession(page);
  await page.goto(`/albums/${album.id}`);

  await expect(page.getByRole('heading', { name: album.name })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Progresso da coleção' })
  ).toBeVisible();

  await page.getByLabel('Nome da seção').fill(createdSection.name);
  await page.getByLabel('Código da seção').fill(createdSection.code);
  await page.getByRole('button', { name: 'Criar seção' }).click();
  await expect(
    page.getByText(`${createdSection.name} foi adicionada.`)
  ).toBeVisible();

  await page.getByLabel('Código da figurinha').first().fill(firstSticker.code);
  await page.getByLabel('Número').fill(String(firstSticker.number));
  await page.getByLabel('Título').fill(firstSticker.title);
  await page.getByRole('button', { name: 'Criar figurinha' }).click();
  await expect(
    page.getByText(`${createdSticker.code} foi adicionada.`)
  ).toBeVisible();

  const searchPanel = page.locator('form').filter({
    has: page.getByRole('button', { name: 'Buscar' })
  });

  await searchPanel.getByLabel('Código da figurinha').fill(secondSticker.code);
  await searchPanel.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByText(`Faltando · ${secondSticker.code}`)).toBeVisible();

  await page
    .locator('article')
    .filter({ hasText: secondSticker.code })
    .getByLabel('Quantidade')
    .fill('1');

  await expect(page.getByText('100%').first()).toBeVisible();
});

test('supports mobile missing, duplicate, code search, and navigation', async ({
  isMobile,
  page
}) => {
  test.skip(!isMobile, 'Mobile-only accessibility and navigation coverage.');

  await mockApi(page);
  await saveSession(page);
  await page.goto(`/albums/${album.id}`);

  await expect(
    page.getByRole('heading', { name: 'Faltantes e repetidas' })
  ).toBeVisible();
  await expect(
    page.getByText(`${secondSticker.code} · ${secondSticker.title}`)
  ).toBeVisible();
  await expect(page.getByText(`${firstSticker.code} · ${firstSticker.title}`))
    .toBeVisible();
  const searchPanel = page.locator('form').filter({
    has: page.getByRole('button', { name: 'Buscar' })
  });

  await searchPanel.getByLabel('Código da figurinha').fill(firstSticker.code);
  await searchPanel.getByRole('button', { name: 'Buscar' }).click();

  await expect(
    page.getByText(`Repetida · ${firstSticker.code}`)
  ).toBeVisible();
  await page.getByRole('link', { name: 'Voltar para álbuns' }).click();
  await expect(
    page.getByRole('heading', { name: 'Álbuns cadastrados' })
  ).toBeVisible();
});
