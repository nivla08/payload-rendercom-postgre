# Setup

## Fresh clone

For a first-time local bootstrap:

```bash
pnpm install
pnpm db:up
pnpm setup:local
pnpm dev
```

What this starter expects locally:

- app runtime is plain Node.js, not Cloudflare
- local database is PostgreSQL
- `pnpm db:up` starts the bundled Docker PostgreSQL service
- `pnpm dev` is the normal daily development command
- Render, Vercel, Neon, and Supabase are optional deployment/database choices, not requirements for local startup

`setup:local` will:

- copy `.env.example` to `.env` if `.env` does not exist yet
- verify that Postgres is reachable and that `DATABASE_URL` does not still use placeholder credentials
- generate Payload types
- run typecheck so the starter is ready for development

Use `setup:local:fresh` when you want to overwrite `.env` from `.env.example` first.

## After pulling latest changes

When teammates have changed schema, generated types, or migrations:

```bash
pnpm sync:local
```

`sync:local` will:

- install dependencies
- regenerate Payload types
- apply schema migrations
- apply app/data migrations
- run starter data verification
- run typecheck

Recommended migration check after pulling:

1. Run `pnpm migrate:status`
2. Run `pnpm migrate`
3. Run `pnpm migrate:app`
4. Run `pnpm verify:data`

How to interpret it:

- if teammates already committed migration files, you usually run them locally
- if you only pulled content/model changes with no migration files yet, confirm whether the branch is incomplete before trying to work around it
- `sync:local` is the easiest safe default when you just want your local repo caught up

Why the split:

- `setup:local` is intentionally light for a fresh starter clone
- `sync:local` is for existing projects where schema history, migrations, and team sync matter

## Important schema-change note for existing projects

Once a project has shared data, schema changes must be paired with migrations.

This includes:

- renaming fields
- changing `dbName`
- changing array/group structures
- renaming globals or collections

For starter experimentation, you can sometimes recover with:

```bash
pnpm db:reset
```

But for real team projects, the safe pattern is:

```bash
pnpm migrate:create
pnpm migrate
pnpm migrate:app
```

Then commit the schema and migration files together.

Use `db:reset` only for disposable local databases, not as a substitute for proper migrations on an active project.

## Existing clone with stale `.env`

If an older clone still has placeholder credentials or an outdated `DATABASE_URL`,
use the fresh reset command:

```bash
pnpm setup:local:fresh
```

This intentionally overwrites `.env` from `.env.example`, installs dependencies,
and then runs the normal local bootstrap flow.

## Local development

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL locally, either with your own instance or `pnpm db:up`.
3. Install dependencies with `pnpm install`.
4. Run `pnpm setup:local`.
5. Start the app with `pnpm dev`.

Daily default:

```bash
pnpm dev
```

After pulling teammate changes:

```bash
pnpm sync:local
pnpm dev
```

## After Editing Schema Files

If you add, remove, rename, or change persisted fields in files such as:

- `src/cms/collections/**`
- `src/cms/globals/**`
- `src/cms/fields/**`
- `src/cms/payload.config.ts`

do not expect `pnpm dev` alone to update PostgreSQL schema.

Typical symptom:

- admin/frontend compiles
- API or page queries fail because the database still reflects the old schema

Use this sequence right after the schema edit:

```bash
pnpm migrate:create
pnpm migrate
pnpm migrate:app
pnpm verify:data
```

Then continue with `pnpm dev`.

Rule of thumb:

- changed schema shape -> create and run a DB migration
- changed existing data only -> run or add an app migration
- changed frontend/service code only -> no DB migration needed

## Docker defaults

If you use the provided Docker PostgreSQL service, the expected local connection string is:

```bash
PROJECT_DB_NAME=payload_starter
LOCAL_POSTGRES_PORT=5432
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/payload_starter
```

If your existing `.env` still has older credentials or placeholder values, update it before running `pnpm setup:local`.

If port `5432` is already used by another local Postgres, pick a different port and keep
`DATABASE_URL` aligned with it:

```bash
LOCAL_POSTGRES_PORT=5433
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/payload_starter
```

## If Postgres is reachable but authentication fails

If `pnpm db:check` passes but `pnpm migrate` fails with:

```text
password authentication failed for user "postgres"
```

that usually means one of these is true:

1. Another local Postgres instance is already bound to `127.0.0.1:5432`
2. The Docker Postgres volume was created earlier with different credentials

Useful recovery commands:

```bash
pnpm db:logs
pnpm db:reset
```

What `db:reset` does:

- stops the Docker Postgres container
- deletes the local Docker volume for this repo
- recreates Postgres with the credentials currently defined in `docker-compose.yml`

Important:

- `db:reset` is destructive for this repo's local Docker database data
- only use it when you are okay resetting local development data
- if you want to keep existing data, update `.env` to match the real Postgres credentials instead
- if Docker cannot bind `5432`, change `LOCAL_POSTGRES_PORT` and `DATABASE_URL` to a free local port like `5433`

## Multiple local clones

To avoid one local project writing into another project's data, every repo should
use its own database name in `DATABASE_URL`.

Good examples:

```bash
PROJECT_DB_NAME=payload_client_portal
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/payload_client_portal

PROJECT_DB_NAME=payload_marketing_site
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/payload_marketing_site

PROJECT_DB_NAME=payload_internal_docs
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/payload_internal_docs
```

Important notes:

- If two repos use the same `DATABASE_URL`, they will share the same database.
- Keep `PROJECT_DB_NAME` and the database portion of `DATABASE_URL` aligned.
- Keep `LOCAL_POSTGRES_PORT` and the port in `DATABASE_URL` aligned when using Docker.
- Different repo folders usually get different Docker Compose volumes automatically, but that does not protect you if both repos point to the same Postgres database name.
- The safest team rule is: one repo, one local database name.

## Required environment variables

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PAYLOAD_PUBLIC_SERVER_URL`

## Optional but common

- `PAYLOAD_CORS_ORIGIN`
- `PAYLOAD_SMTP_*`
- `PAYLOAD_EMAIL_FROM`
- `PAYLOAD_STORAGE_PROVIDER`
- `PAYLOAD_MEDIA_DIR`

## First user bootstrap

The first created account is automatically assigned the `super-admin` role. This keeps bootstrapping simple while still enforcing stronger role rules for later users.

## Recommended local commands

- `pnpm setup:local`: lightweight first-time bootstrap
- `pnpm setup:local:fresh`: overwrite `.env` from the starter example, then bootstrap locally
- `pnpm sync:local`: full local sync for existing projects after pulling changes
- `pnpm db:logs`: inspect Docker Postgres logs
- `pnpm db:reset`: recreate the local Docker Postgres database volume
- `pnpm db:up`: start the bundled Docker PostgreSQL service
- `pnpm db:check`: validate local database reachability before migrations
- `pnpm migrate`: run Payload DB migrations
- `pnpm migrate:app`: run app/data migrations
- `pnpm migrate:status`: inspect DB/app migration state
- `pnpm verify:data`: validate starter migration/data state
