# Generators

This starter includes plop generators for consistent scaffolding.

## Commands

- `pnpm gen`
- `pnpm gen:collection`
- `pnpm gen:global`
- `pnpm gen:block`

## Purpose

Generators keep new modules aligned with the starter architecture so teams avoid copy-paste drift.

## Current templates

- collection folder template with local hooks, slug, publishing fields, authorship, meta, and drafts enabled
- global template with starter-safe admin-only update access
- block folder template with `config.ts` and `index.ts`

Generated paths:

- collections: `src/cms/collections/<Name>/index.ts`
- globals: `src/cms/globals/<Name>/index.ts`
- blocks: `src/cms/blocks/<Name>/config.ts`

Collection generators also scaffold:

- `src/cms/collections/<Name>/hooks/assignAuthor.ts`
- `src/cms/collections/<Name>/hooks/setPublishedAt.ts`
- `src/cms/collections/<Name>/hooks/createAuditHooks.ts`

After generating a new module, register it in the relevant `src/cms/collections/index.ts`, `src/cms/globals/index.ts`, or block registry used by your project.
