# Migrations

This starter uses two migration layers:

- Payload schema migrations for database structure
- optional app/data migrations for one-off content or data transitions

## Commands

- `pnpm migrate:create`
- `pnpm migrate`
- `pnpm migrate:app`
- `pnpm migrate:status`

## Team workflow

1. Change a collection, global, or field schema.
2. Generate a Payload migration with `pnpm migrate:create`.
3. Commit both the schema change and generated migration files.
4. Apply DB migrations locally with `pnpm migrate`.
5. Run app/data migrations if needed with `pnpm migrate:app`.

## Renames and schema updates

When a project already has shared data, do not treat schema changes as "just code changes."
Any rename or structural update should ship with an explicit migration.

This is especially important when you change:

- collection slugs
- global slugs
- field names
- `dbName` values
- array/group nesting that changes generated table names
- relationship structure or field types

Why this matters:

- Payload/Drizzle may ask whether a table is new or renamed
- generic names can make rename prompts ambiguous
- teammates can accidentally point a real table rename at the wrong table
- production data can be lost or orphaned if schema history is not captured clearly

Safe team pattern:

1. Make the schema change.
2. Run `pnpm migrate:create`.
3. Review the generated migration carefully.
4. If the prompt asks about a rename, confirm it only when you are certain it maps to the same existing table/data.
5. Commit the schema change and migration in the same PR.
6. Have teammates run `pnpm sync:local` after pulling.

Important:

- interactive prompts are for local migration generation time
- deployment should not depend on answering rename prompts manually
- production/Render should apply the already-committed migration with `pnpm migrate`
- if deployment would need someone to choose between "create table" and "rename table", the migration workflow is not finished yet

For fresh starter experimentation only:

- it is fine to use `pnpm db:reset` while the project is still disposable
- do not rely on `db:reset` once a project has real shared development data

Rule of thumb:

- new starter / disposable local DB: reset is acceptable
- existing team project / shared DB history: write and commit the migration

## After pulling latest changes

Every teammate should run:

```bash
pnpm install
pnpm migrate
pnpm migrate:app
```

## Production safety

On Render, run `pnpm migrate && pnpm migrate:app` as the pre-deploy command so the release is ready before traffic shifts.
