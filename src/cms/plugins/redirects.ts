import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import type { Plugin } from 'payload'

import { hasAnyPermission, isAdminOrHasPermission, PERMISSIONS } from '@/cms/access'
import { isAdmin } from '@/cms/utilities/users'

/**
 * Starter-safe redirect management:
 * - plugin manages the `redirects` collection
 * - scoped to routable collections only
 * - admin visibility stays behind centralized RBAC helpers
 */
export const createRedirectPlugins = (): Plugin[] => {
  return [
    redirectsPlugin({
      collections: ['pages', 'posts'],
      overrides: {
        admin: {
          hidden: ({ user }) =>
            !isAdmin(user) &&
            !hasAnyPermission(user, [
              PERMISSIONS.REDIRECTS_ACCESS,
              PERMISSIONS.REDIRECTS_CREATE,
              PERMISSIONS.REDIRECTS_UPDATE,
              PERMISSIONS.REDIRECTS_DELETE,
            ]),
        },
        access: {
          admin: ({ req }) =>
            isAdmin(req.user) ||
            hasAnyPermission(req.user, [
              PERMISSIONS.REDIRECTS_ACCESS,
              PERMISSIONS.REDIRECTS_CREATE,
              PERMISSIONS.REDIRECTS_UPDATE,
              PERMISSIONS.REDIRECTS_DELETE,
            ]),
          create: isAdminOrHasPermission(PERMISSIONS.REDIRECTS_CREATE),
          delete: isAdminOrHasPermission(PERMISSIONS.REDIRECTS_DELETE),
          read: () => true,
          update: isAdminOrHasPermission(PERMISSIONS.REDIRECTS_UPDATE),
        },
      },
    }),
  ]
}
