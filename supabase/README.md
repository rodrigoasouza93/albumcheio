# Supabase local database

The schema for the album catalog and private collections lives in `supabase/migrations`.
The local seed in `supabase/seed.sql` creates one published sample album with sections and stickers.
Additional catalog seeds live in `supabase/seeds`.

## Apply migrations locally

```bash
supabase start
supabase db reset
```

`supabase db reset` recreates the local database, applies every migration, and runs `supabase/seed.sql`.

## Seed the 2026 World Cup album

After the local Supabase database is running and migrated, run:

```bash
pnpm run seed:copa2026
```

This applies `supabase/seeds/copa-2026.sql`, which creates or updates the published `Figurinhas da Copa 2026` catalog with:

- 48 team sections from groups A-L.
- 20 stickers per team.
- 20 FIFA World Cup History stickers (`FWC00` through `FWC19`).
- 14 Coca-Cola stickers (`CC1` through `CC14`).

The seed is idempotent and can be run more than once.

If the album sections already exist and only the team stickers need to be backfilled, run:

```bash
pnpm run seed:copa2026:teams
```

This applies `supabase/seeds/copa-2026-team-stickers-only.sql`.

## Create a new migration

```bash
supabase migration new describe_change
```

Keep migrations append-only. Do not edit an applied migration in shared environments; add a new migration instead.

## RLS expectations

- `profiles` rows are visible and writable only to the authenticated user whose `auth.uid()` matches `profiles.id`.
- `collection_items` rows are visible and writable only to the authenticated user whose `auth.uid()` matches `collection_items.user_id`.
- `albums`, `album_sections`, and `stickers` are shared catalog tables. Authenticated users can read and write them during the MVP.

## Manual RLS smoke test

Create two Supabase Auth users locally, then use each user's access token with the Supabase SQL editor or API.
Rows inserted into `collection_items` with user A's UUID must not be returned when querying with user B's token.
