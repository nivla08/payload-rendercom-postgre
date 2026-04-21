# RBAC

## Roles

- `super-admin`: full control and last-super-admin protection
- `admin`: full operational access without immutable super-admin guarantees
- `editor`: owns and manages their own content by default

## Design

- roles and permissions live in `src/cms/auth/`
- access helpers live in `src/cms/access/`
- collection configs consume centralized access helpers instead of inline permission logic
- effective permissions are derived from assigned roles only

There is no per-user permission override field in the `users` collection. To change a user's access, update the role preset and assign that role to the user.

## How to assign permissions to a role

1. Add or reuse a permission constant in `src/cms/auth/permissions.ts`.
2. Add that permission to the relevant role preset in `src/cms/auth/roles.ts`.
3. Wire the collection/global access check to that same permission in the relevant schema file.
4. Verify the role in admin/API using a user that only has that role.

Example:

```ts
import { PERMISSIONS, ROLES } from '@/cms/auth'

export const ROLE_PRESETS = {
  [ROLES.EDITOR]: [
    PERMISSIONS.POSTS_ACCESS,
    PERMISSIONS.POSTS_CREATE,
    PERMISSIONS.POSTS_UPDATE_OWN,
  ],
}
```

## How to create a new role

1. Add the role constant and preset in `src/cms/auth/roles.ts`.
2. Add the role to the `roles` field options in `src/cms/collections/Users/index.ts`.
3. Review `src/cms/collections/Users/hooks/beforeChange.ts` for starter defaults and user lifecycle rules.
4. If self-registration should use the new role, update both:
   `src/cms/globals/SiteSettings/index.ts`
   `src/lib/site-settings.ts`
5. Test admin visibility and create/update/delete behavior with a user that has only the new role.

## User deletion policy

The starter defaults to safe deactivation instead of hard deletion. Hard delete strategies are opt-in per user:

- `deactivate`
- `reassign`
- `delete-owned-content`

The last `super-admin` cannot be downgraded or deleted, and users cannot delete themselves.

## Registration policy

Public user creation is controlled centrally by `site-settings.auth`.

- first user bootstrap is always allowed and becomes `super-admin`
- after bootstrap, anonymous user creation is allowed only when `allowRegistration` is enabled
- if `registrationRequiresApproval` is enabled, self-registered users are created with `status = blocked`
- self-registered users can receive the configured default role, or no role at all

This keeps registration policy in site settings and user lifecycle hooks instead of scattering it across frontend code.
