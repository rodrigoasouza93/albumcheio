import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(currentDirectory, '../../../..');
const migrationsDirectory = resolve(workspaceRoot, 'supabase/migrations');
const seedPath = resolve(workspaceRoot, 'supabase/seed.sql');

const normalizeSql = (sql: string) =>
  sql.replace(/\s+/g, ' ').trim().toLowerCase();
const readMigrations = () =>
  readdirSync(migrationsDirectory)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort()
    .map((fileName) =>
      readFileSync(resolve(migrationsDirectory, fileName), 'utf8')
    )
    .join('\n');

describe('supabase catalog and collection schema', () => {
  const migrationSql = readMigrations();
  const normalizedMigrationSql = normalizeSql(migrationSql);

  it('creates every table required by the album catalog and private collections', () => {
    const expectedTables = [
      'profiles',
      'albums',
      'album_sections',
      'stickers',
      'collection_items'
    ];

    expectedTables.forEach((tableName) => {
      expect(normalizedMigrationSql).toContain(
        `create table public.${tableName}`
      );
      expect(normalizedMigrationSql).toContain(
        `alter table public.${tableName} enable row level security`
      );
    });
  });

  it('defines data integrity constraints for sticker codes and collection quantities', () => {
    expect(normalizedMigrationSql).toContain(
      'constraint stickers_album_code_unique unique (album_id, code)'
    );
    expect(normalizedMigrationSql).toContain(
      'constraint collection_items_quantity_total_non_negative check (quantity_total >= 0)'
    );
    expect(normalizedMigrationSql).toContain(
      'constraint collection_items_user_sticker_unique unique (user_id, sticker_id)'
    );
    expect(normalizedMigrationSql).toContain(
      'constraint stickers_section_belongs_to_album foreign key (album_id, section_id)'
    );
    expect(normalizedMigrationSql).toContain(
      'constraint stickers_code_normalized check (code = upper(btrim(code)) and length(code) > 0)'
    );
  });

  it('adds indexes for code search, progress, missing stickers, and duplicates', () => {
    const expectedIndexes = [
      'create index stickers_album_section_sort_idx',
      'create index stickers_album_sort_idx',
      'create index collection_items_user_quantity_idx',
      'create index collection_items_user_owned_idx',
      'where quantity_total > 0',
      'create index collection_items_user_duplicates_idx',
      'where quantity_total > 1'
    ];

    expectedIndexes.forEach((indexSnippet) => {
      expect(normalizedMigrationSql).toContain(indexSnippet);
    });
  });

  it('restricts profile and collection access to the authenticated owner', () => {
    const ownerPolicies = [
      'create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id)',
      'create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id)',
      'create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id)',
      'create policy collection_items_select_own on public.collection_items for select to authenticated using ((select auth.uid()) = user_id)',
      'create policy collection_items_insert_own on public.collection_items for insert to authenticated with check ((select auth.uid()) = user_id)',
      'create policy collection_items_update_own on public.collection_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)'
    ];

    ownerPolicies.forEach((policySnippet) => {
      expect(normalizedMigrationSql).toContain(policySnippet);
    });
  });

  it('allows authenticated users to read and write the shared catalog in the MVP', () => {
    const catalogPolicySnippets = [
      'create policy albums_select_authenticated on public.albums for select to authenticated using (true)',
      'create policy album_sections_insert_authenticated on public.album_sections for insert to authenticated with check ((select auth.uid()) is not null)',
      'create policy stickers_update_authenticated on public.stickers for update to authenticated using ((select auth.uid()) is not null) with check ((select auth.uid()) is not null)',
      'grant select, insert, update, delete on public.profiles, public.albums, public.album_sections, public.stickers, public.collection_items to authenticated'
    ];

    catalogPolicySnippets.forEach((policySnippet) => {
      expect(normalizedMigrationSql).toContain(policySnippet);
    });
  });
});

describe('supabase seed catalog', () => {
  const seedSql = readFileSync(seedPath, 'utf8');
  const normalizedSeedSql = normalizeSql(seedSql);

  it('creates a minimal album with sections and stickers for local tests', () => {
    expect(normalizedSeedSql).toContain('insert into public.albums');
    expect(normalizedSeedSql).toContain('world football sample');
    expect(normalizedSeedSql).toContain('insert into public.album_sections');
    expect(normalizedSeedSql).toContain("'open'");
    expect(normalizedSeedSql).toContain("'bra'");
    expect(normalizedSeedSql).toContain('insert into public.stickers');
    expect(normalizedSeedSql).toContain("'fwc01'");
    expect(normalizedSeedSql).toContain("'bra01'");
    expect(normalizedSeedSql).toContain("'bra02'");
  });
});
