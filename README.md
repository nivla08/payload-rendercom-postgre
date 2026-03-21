# Payload Postgres Starter

Reusable Payload CMS starter for Node.js deployments with PostgreSQL.

This starter is intentionally not a demo app. It focuses on production-grade building blocks that future Payload projects usually need:

- centralized RBAC with `super-admin`, `admin`, and `editor`
- guarded user lifecycle and safe delete strategy
- SMTP email foundation with a safe console fallback for local work
- explicit console vs SMTP email mode for projects that are not ready to send real email yet
- site settings with maintenance mode and default frontend meta
- REST-first API surface with GraphQL disabled by default
- Payload schema migrations plus optional app/data migrations
- generic starter collections and globals
- plop generators for collections, globals, and blocks
- environment validation, deployment guides, and team docs

## Quick start

```bash
pnpm install
pnpm db:up
pnpm setup:local
pnpm dev
```

Open `http://localhost:3000` and create the first user. The first account is automatically promoted to `super-admin`.

For local development across multiple Payload repos, use a unique database name
per repo in `DATABASE_URL` so projects do not share the same local Postgres DB.
Set `PROJECT_DB_NAME` to the same value for an easy team convention.
If `5432` is already taken on your machine, set `LOCAL_POSTGRES_PORT` and update
`DATABASE_URL` to match, for example `5433`.

Platform-ready notes:

- explicit Node version pinning via `.node-version` and `render.yaml`
- `/api/health` as a generic health endpoint
- official S3-compatible object storage support for production media
- provider-specific docs for Render, Vercel, Neon, and Supabase

## Starter plan

Must-have:

- deployment-ready Node + PostgreSQL baseline
- reusable RBAC and access helpers
- SMTP/email service abstraction
- safe user deletion and last-super-admin protection
- schema and app migration workflow
- generators and team docs

Optional but valuable:

- audit logs
- starter globals
- seed script for non-demo defaults
- preview helpers and shared field builders

Skipped because too project-specific:

- public site routes and domain content models
- Cloudflare/D1/R2 runtime pieces
- contact/search/registration flows from the source project
- website-specific navigation, SEO, and asset-usage indexing logic

## Project structure

```text
src/
  cms/
    access/      Central access helpers and policies
    auth/        Roles, permissions, and user policy helpers
    collections/ Generic starter collections with local hooks per collection
    email/       SMTP adapter, templates, and service helpers
    fields/      Reusable field builders
    globals/     Generic globals
    plugins/     Payload plugin extension points
    utilities/   Small shared helpers
  lib/           Metadata, site-settings, migrations, and view helpers
  config/        Environment parsing and app configuration
  migrations/    DB and app/data migration support
  scripts/       Seed, verify, and migration helper scripts
docs/
```

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm clean:next`
- `pnpm start`
- `pnpm db:up`
- `pnpm db:check`
- `pnpm db:logs`
- `pnpm db:reset`
- `pnpm setup:local`
- `pnpm setup:local:fresh`
- `pnpm sync:local`
- `pnpm migrate`
- `pnpm migrate:create`
- `pnpm migrate:app`
- `pnpm migrate:status`
- `pnpm verify:data`
- `pnpm seed`
- `pnpm verify`
- `pnpm gen`
- `pnpm gen:collection`
- `pnpm gen:global`
- `pnpm gen:block`

## Documentation

- [Setup](./docs/setup.md)
- [Deployment Overview](./docs/deployment.md)
- [Render Deploy](./docs/render-deploy.md)
- [Vercel Deploy](./docs/vercel-deploy.md)
- [Database Providers](./docs/database-providers.md)
- [Migrations](./docs/migrations.md)
- [RBAC](./docs/rbac.md)
- [Email](./docs/email.md)
- [Generators](./docs/generators.md)
- [Redirects](./docs/redirects.md)
- [Site Settings](./docs/site-settings.md)
- [Storage](./docs/storage.md)

`setup:local` is intentionally lightweight for a fresh starter clone.
Use `setup:local:fresh` when you want a full clean local bootstrap, and `sync:local`
when working on an existing project with committed migrations and team schema changes.

For active projects, renaming fields, changing `dbName`, or restructuring arrays/groups
should always be captured in a committed migration. `db:reset` is only safe for disposable
local databases while shaping a fresh starter. See [Migrations](./docs/migrations.md).
