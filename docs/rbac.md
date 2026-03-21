# RBAC

## Roles

- `super-admin`: full control and last-super-admin protection
- `admin`: full operational access without immutable super-admin guarantees
- `editor`: owns and manages their own content by default

## Design

- roles and permissions live in `src/cms/auth/`
- access helpers live in `src/cms/access/`
- collection configs consume centralized access helpers instead of inline permission logic

## Adding a new role safely

1. Add the role constant in `src/cms/auth/roles.ts`.
2. Define its permission preset in `ROLE_PRESETS`.
3. Add the role to the `Users` collection field options.
4. Reuse the existing access helpers instead of embedding raw role checks in collections.

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
