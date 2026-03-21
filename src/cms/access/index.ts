import type { Access } from 'payload'

import { PERMISSIONS, type Permission } from '@/cms/auth'
import { getUserPermissions, isAdmin } from '@/cms/utilities/users'
export * from './canCreateUser'

export { PERMISSIONS }

export const hasPermission = (user: unknown, permission: Permission): boolean => {
  return getUserPermissions(user).includes(permission)
}

/**
 * Check whether a user has at least one permission from a list.
 *
 * Useful for admin navigation visibility or grouped collection access.
 */
export const hasAnyPermission = (user: unknown, permissions: Permission[]): boolean => {
  const granted = getUserPermissions(user)
  return permissions.some((permission) => granted.includes(permission))
}

/**
 * Access helper for full-collection privileges.
 *
 * Example:
 * `update: isAdminOrHasPermission(PERMISSIONS.POSTS_UPDATE)`
 */
export const isAdminOrHasPermission = (permission: Permission): Access => {
  return ({ req }) => isAdmin(req.user) || hasPermission(req.user, permission)
}

/**
 * Access helper for admin-area visibility when multiple permissions can unlock
 * the same area.
 */
export const isAdminOrHasAnyPermission = (permissions: Permission[]): Access => {
  return ({ req }) => isAdmin(req.user) || hasAnyPermission(req.user, permissions)
}

/**
 * Build an owner-scoped `where` clause for access control.
 *
 * Example:
 * `read: ownByField('author')`
 */
export const ownByField = (field = 'author'): Access => {
  return ({ req }) => {
    const userId = req.user?.id
    if (typeof userId !== 'string' && typeof userId !== 'number') return false

    return {
      [field]: {
        equals: userId,
      },
    }
  }
}

/**
 * Common pattern for resources that support both full-management permissions and
 * owner-only permissions.
 *
 * Example:
 * `delete: isAdminOrHasPermissionOrOwn({
 *   anyPermission: PERMISSIONS.POSTS_DELETE,
 *   ownPermission: PERMISSIONS.POSTS_DELETE_OWN,
 * })`
 */
export const isAdminOrHasPermissionOrOwn = (options: {
  anyPermission: Permission
  ownPermission: Permission
  ownerField?: string
}): Access => {
  const ownerField = options.ownerField ?? 'author'

  return ({ req }) => {
    if (isAdmin(req.user) || hasPermission(req.user, options.anyPermission)) {
      return true
    }

    if (!hasPermission(req.user, options.ownPermission)) {
      return false
    }

    const userId = req.user?.id
    if (typeof userId !== 'string' && typeof userId !== 'number') return false

    return {
      [ownerField]: {
        equals: userId,
      },
    }
  }
}

/**
 * Default public read policy for draft-enabled collections:
 * privileged users can read everything, everyone else sees published docs only.
 */
export const readPublishedOrPrivileged: Access = ({ req }) => {
  if (isAdmin(req.user)) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}

export const adminOnly: Access = ({ req }) => isAdmin(req.user)
export const adminOnlyBoolean = ({ req }: { req: { user?: unknown } }): boolean => isAdmin(req.user)

/**
 * Boolean-only admin visibility helper for places where Payload expects
 * `boolean`, not a `where` object.
 */
export const canAccessAdmin = (permissions: Permission[]) => {
  return ({ req }: { req: { user?: unknown } }): boolean => {
    return isAdmin(req.user) || hasAnyPermission(req.user, permissions)
  }
}

export const canAccessSettings = isAdminOrHasPermission(PERMISSIONS.SETTINGS_UPDATE)
