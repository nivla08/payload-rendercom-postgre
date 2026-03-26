# Deployment Overview

This starter is designed for modern Node.js deployments backed by PostgreSQL.

Supported targets today:

- Render
- Vercel
- Neon for managed Postgres
- Supabase for managed Postgres

Important distinction:

- Render and Vercel are app hosting targets
- Neon and Supabase are PostgreSQL providers for `DATABASE_URL`
- a common pairing is Vercel + Neon or Vercel + Supabase
- another common pairing is Render web service + Render PostgreSQL

## Core assumptions

- app runtime: Node.js
- database: PostgreSQL
- production media: external object storage is recommended
- migrations: committed and applied non-interactively during deploy

## Production requirements

Set these in every production environment:

- `NODE_ENV=production`
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PAYLOAD_PUBLIC_SERVER_URL`
- `PAYLOAD_CORS_ORIGIN`

Recommended when using previews:

- `PAYLOAD_PREVIEW_SECRET`

Recommended when using production media storage:

- `PAYLOAD_STORAGE_PROVIDER=s3`
- `PAYLOAD_STORAGE_S3_BUCKET`
- provider-specific S3-compatible vars like region, endpoint, and credentials

Provider guidance:

- Render can host both the app and the database, but production uploads should still use S3-compatible storage if durability matters
- Vercel should use external PostgreSQL plus S3-compatible storage because local filesystem is ephemeral
- Supabase is typically used here as the managed Postgres connection behind `DATABASE_URL`

## Deployment flow

Use a flow close to:

1. install dependencies
2. generate Payload types if needed
3. apply committed migrations
4. build the app
5. start the app

For deployments that support a pre-deploy command, use:

```bash
pnpm migrate && pnpm migrate:app
```

Use this checklist before deploy:

1. Confirm all schema changes have committed migration files
2. Run `pnpm migrate:status`
3. Run `pnpm verify`
4. Run `pnpm verify:data`
5. Apply `pnpm migrate && pnpm migrate:app` in the platform's pre-deploy or CI step

## Health checks

The starter exposes:

- `/api/health`

Platforms that support health checks can use that route directly.

## Media storage

Local disk storage is acceptable for development.

For production:

- prefer S3-compatible storage
- do not rely on local disk durability
- this is especially important for Vercel and multi-instance Node deployments

## Provider docs

- Render: `docs/render-deploy.md`
- Vercel: `docs/vercel-deploy.md`
- Managed Postgres notes: `docs/database-providers.md`
