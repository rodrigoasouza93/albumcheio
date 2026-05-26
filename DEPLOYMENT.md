# Deployment

This repository is a pnpm workspace with deployable apps in `apps/web` and `apps/api`, plus shared code in `packages/shared`.

## CI

GitHub Actions runs on pull requests and pushes to `main`:

1. Install dependencies with `pnpm install --frozen-lockfile`.
2. Run lint with `pnpm run lint`.
3. Run tests with `pnpm run test`.
4. Build the full workspace with `pnpm run build`.

## Web on Vercel

Create the Vercel project from the repository and set the project root to the Next.js app directory.

- Framework preset: Next.js
- Root directory: `apps/web`
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm run build`
- Output directory: `.next`

The Vercel configuration lives in `apps/web/vercel.json` so Vercel can detect the `next` dependency from `apps/web/package.json`.

Required environment variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`NEXT_PUBLIC_API_BASE_URL` should point to the Render API including the global API prefix, for example:

```text
https://albumcheio-api.onrender.com/api/v1
```

## API on Render

The root `render.yaml` defines a Node web service for `apps/api`.

- Build command: `pnpm install --frozen-lockfile && pnpm run build:api`
- Start command: `pnpm --filter @albumcheio/api start`
- Health check: `/api/v1/health`

Render sets `PORT` automatically. Local development can keep using `API_PORT`; the API reads `PORT` first and then falls back to `API_PORT`.

Required environment variables:

- `WEB_ORIGIN`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Set `WEB_ORIGIN` to the production Vercel URL, for example:

```text
https://albumcheio.vercel.app
```
