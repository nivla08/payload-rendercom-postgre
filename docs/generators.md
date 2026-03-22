# Generators

This starter keeps the built-in generator commands aligned with the distro defaults. In this repo:

- collections and globals still delegate to plop
- fields and blocks use the interactive local generator

## Commands

- `pnpm gen`
- `pnpm gen:field`
- `pnpm gen:collection`
- `pnpm gen:global`
- `pnpm gen:block`

## Purpose

Generators keep new modules aligned with the starter architecture so teams avoid copy-paste drift.

## Interactive generators

### `pnpm gen:field`

Use this to create reusable field helpers in `src/cms/fields`.

Behavior:

- supports `single field`, `field group`, `row`, and `tabs`
- normalizes helper file names to camelCase
- normalizes generated field names to camelCase
- updates `src/cms/fields/index.ts` when you confirm export
- fails fast if the helper file name or helper export already exists
- supports `--dry-run`

Generated output:

- `src/cms/fields/<camelName>.ts`
- optional `src/cms/fields/index.ts` update

### `pnpm gen:block`

Use this to create CMS blocks in the TARGET block structure while keeping frontend renderer stubs aligned with the current starter.

Behavior:

- generates CMS block files in `src/cms/blocks/<BlockName>/`
- optionally generates a frontend block component stub in `src/components/blocks/<BlockName>Block.tsx`
- supports:
  - `Create inline field`
  - `Use existing reusable field`
  - back out of reusable helper selection and return to inline field creation
- scans existing reusable helpers from `src/cms/fields`
- normalizes generated field names to camelCase
- keeps block slugs kebab-case
  - example: `faq-block`
- keeps renderer registry keys camelCase
  - example: `faqBlock`
- duplicate protection checks:
  - existing block folder/name
  - existing exported block symbol
  - existing block slug
  - existing renderer registry key
- repeated runs keep exports/imports/registry updates idempotent
- supports `--dry-run`

Generated output:

- `src/cms/blocks/<BlockName>/config.ts`
- `src/cms/blocks/<BlockName>/index.ts`
- optional `src/components/blocks/<BlockName>Block.tsx`
- optional registry/export updates

The frontend block registry also resolves kebab-case block slugs through camelCase renderer keys, so a Payload slug like `faq-block` can map to a renderer key like `faqBlock`.

## Plop templates

- collection folder template with local hooks, slug, publishing fields, authorship, meta, and drafts enabled
- global template with starter-safe admin-only update access

Generated paths:

- collections: `src/cms/collections/<Name>/index.ts`
- globals: `src/cms/globals/<Name>/index.ts`

Collection generators also scaffold:

- `src/cms/collections/<Name>/hooks/assignAuthor.ts`
- `src/cms/collections/<Name>/hooks/setPublishedAt.ts`
- `src/cms/collections/<Name>/hooks/createAuditHooks.ts`

After generating a new collection or global, register it in the relevant `src/cms/collections/index.ts` or `src/cms/globals/index.ts`.
