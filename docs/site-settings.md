# Site Settings

`site-settings` centralizes frontend defaults and operational controls that most
projects need early.

## Included groups

- `siteDetails`
- `meta`
- `auth`
- `maintenance`

## Auth / Registration

`site-settings.auth` controls whether the project allows public self-registration.

- `allowRegistration`: enables public `users` create access after bootstrap
- `registrationRequiresApproval`: new self-registered users are created as `blocked`
- `defaultRole`: starter-safe default role for self-registered users
- `registrationSuccessMessage`: frontend-friendly message for projects that add a custom register flow later
- `registrationRedirectURL`: optional redirect target for custom register flows
- `registrationHoneypotEnabled`: reserved for projects that add a public registration form

The starter intentionally does not ship a public registration page or API route.
These settings provide the reusable CMS-side policy only.

## Default Meta

`site-settings.meta` acts as a fallback only.

Priority order:

1. document `meta`
2. `site-settings.meta`
3. hardcoded page/layout fallback text

This keeps site-wide defaults helpful without overriding document-specific SEO.

## Maintenance

When maintenance mode is enabled, frontend routes are redirected to `/maintenance`
unless a path is allowlisted or a valid bypass cookie is present.

Supported allowlist patterns:

- `*` for all frontend routes
- exact paths like `/about`
- prefix wildcards like `/posts/*`
- plain section paths like `/posts` also match nested paths such as `/posts/my-post`

By default, admin, API, Next internals, and framework asset routes are not blocked.

## Bypass

If `bypassSecretEnabled` is on, a valid bypass cookie can be issued through:

```text
/api/maintenance/bypass?secret=<secret>&redirect=/
```

This is intended for trusted reviewers or internal stakeholders during a maintenance window.
