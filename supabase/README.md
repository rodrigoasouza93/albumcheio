# Supabase local database

The schema for the album catalog and private collections lives in `supabase/migrations`.
The local seed in `supabase/seed.sql` creates one published sample album with sections and stickers.

## Apply migrations locally

```bash
supabase start
supabase db reset
```

`supabase db reset` recreates the local database, applies every migration, and runs `supabase/seed.sql`.

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
