# Database Providers

This starter is PostgreSQL-first and works well with:

- Render PostgreSQL
- Neon
- Supabase
- self-managed PostgreSQL

## Common requirement

All providers ultimately supply a PostgreSQL connection string via:

- `DATABASE_URL`

How to think about provider roles in this starter:

- Render PostgreSQL, Neon, and Supabase are database providers
- Render web service and Vercel are app hosting choices
- the app code stays provider-agnostic as long as `DATABASE_URL` is valid

## Neon

Neon is a strong fit when you want:

- serverless-friendly managed Postgres
- easy branching workflows
- clean pairing with Vercel

Notes:

- use the pooled/production-ready connection string where appropriate
- keep SSL enabled if your Neon connection string requires it

## Supabase

Supabase is a strong fit when you want:

- managed Postgres
- database tooling and admin UI
- the option to add more Supabase services later

Notes:

- this starter only needs the Postgres database connection
- Supabase-specific auth/storage features are optional and not required by the starter
- for this starter, treat Supabase as the Postgres provider behind `DATABASE_URL`
- Supabase does not replace the need for an app host such as Render or Vercel

## Render PostgreSQL

Render is a strong fit when you want:

- app and database managed in one platform
- pre-deploy migration flow
- a straightforward Node service deployment

## Team guidance

- use committed migrations for every schema change
- do not rely on `db:reset` outside disposable local development
- keep production secrets and connection strings provider-specific, but keep app architecture provider-agnostic
- keep local Docker/Postgres values in `.env` separate from hosted provider connection strings
