# Migrations

This starter uses two migration layers:

- Payload schema migrations for database structure
- optional app/data migrations for one-off content or data transitions

## Commands

- `pnpm migrate:create`
- `pnpm migrate`
- `pnpm migrate:app`
- `pnpm migrate:status`
- `pnpm verify:data`

## Team workflow

1. Change a collection, global, or field schema.
2. Generate a Payload migration with `pnpm migrate:create`.
3. Commit both the schema change and generated migration files.
4. Apply DB migrations locally with `pnpm migrate`.
5. Run app/data migrations if needed with `pnpm migrate:app`.

Practical local workflow after a schema edit:

```bash
pnpm migrate:create
pnpm migrate
pnpm migrate:app
pnpm verify:data
```

## When To Create A Migration

Create a new Payload migration when you changed persisted schema such as:

- collection fields
- global fields
- field names
- `dbName` values
- array/group structure that changes generated tables
- relationship field types or shape

Use:

```bash
pnpm migrate:create
```

## How To Scope A Migration

Prefer one migration per logical schema change set.

Good examples:

- one feature adds 2 related fields to `posts` -> one migration
- one feature updates a collection and its related versioned fields -> one migration
- one PR changes multiple related schema pieces for the same feature -> one migration

Split into separate migrations when changes are unrelated or have different rollout risk.

Good examples:

- one migration for a new content field, another for unrelated settings restructuring
- one migration for additive schema, another later migration for a risky rename
- one schema migration plus a separate app migration for data backfill or repair

Recommended rule:

- related schema changes in the same feature/PR: keep together
- unrelated schema changes: split them
- schema changes and data backfills: separate them

Avoid:

- mixing unrelated cleanup into the migration for your current feature
- editing an old committed migration instead of creating a new one
- committing a generated migration that includes unexpected drift you did not intend to change

After running `pnpm migrate:create`, review the file before applying it.

If the generated migration includes unrelated changes:

1. stop
2. investigate the drift
3. fix the baseline or schema issue
4. regenerate the migration

Do not treat these as migration-worthy by default:

- frontend-only changes
- styling changes
- route/component logic changes that do not change stored data shape
- test-only changes

## When To Create An App Migration

Create an app/data migration when the database schema is already correct, but existing rows or documents need one-time repair or backfill logic.

Typical examples:

- backfilling a new derived field
- normalizing existing values after a schema rollout
- repairing legacy content into the new expected format

Use:

```bash
pnpm migrate:app
```

App migrations complement schema migrations. They do not replace `pnpm migrate:create`.

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

## How To Check Whether A Migration Is Needed

Use these questions:

1. Did I change how data is stored in Postgres?
2. Did I rename a field, `dbName`, collection, global, or nested structure?
3. Did I change a relationship or other persisted field shape?

If yes, create a Payload migration with:

```bash
pnpm migrate:create
```

Then apply and verify:

```bash
pnpm migrate
pnpm migrate:app
pnpm verify:data
```

Common symptom of a missing DB migration:

- the app compiles, but queries fail because the database does not yet have the new column/table shape

Important:

- interactive prompts are for local migration generation time
- deployment should not depend on answering rename prompts manually
- production deployments should apply the already-committed migration with `pnpm migrate`
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
pnpm migrate:status
pnpm migrate
pnpm migrate:app
pnpm verify:data
```

How to interpret it:

- if `migrate:status` shows pending work, run the migrations before continuing
- if a branch changed schema files but no migration was committed, stop and fix that in the branch instead of relying on `db:reset`
- `pnpm sync:local` is still the easiest all-in-one safe command after pulling

## Production safety

On platforms that support a pre-deploy step, run `pnpm migrate && pnpm migrate:app` before the new release receives traffic.

## Practical Team Rules

- Commit schema changes and generated migration files in the same PR.
- Never rely on interactive migration generation during deployment.
- Use `db:reset` only for disposable local starter work, not active shared projects.
- Run `pnpm verify:data` after migrations so pending app migration issues are surfaced early.
