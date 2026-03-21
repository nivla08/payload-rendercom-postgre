# Redirects

The starter supports the official Payload redirects plugin for CMS-managed URL redirects.

## What it gives you

- a `redirects` collection in the admin
- redirect management scoped to routable content collections
- frontend helpers for `redirect-or-404` handling when a path no longer resolves

## Current starter scope

The plugin is configured for:

- `pages`
- `posts`

This is intentionally small and starter-safe.

## RBAC

Redirect access is permission-driven through `src/cms/auth/permissions.ts`.

- `redirects:access`
- `redirects:create`
- `redirects:update`
- `redirects:delete`

By default, `admin` and `super-admin` can manage redirects.

## Frontend usage

The starter includes a fallback frontend catch-all route that already uses the shared redirect-or-404 handler for unmatched paths.

Use `findRedirectByPath()` directly when a content lookup misses:

```ts
const redirect = await findRedirectByPath(path)
if (redirect) permanentRedirect(redirect.to)
notFound()
```

Or use the shared helper:

```ts
return resolveRouteMiss(path)
```

## Important note

The starter currently includes manual redirect management only.
Automatic redirect creation for slug changes can be added later as an opt-in feature.
