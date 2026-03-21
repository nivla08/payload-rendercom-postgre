import type { Access } from 'payload'

import { PERMISSIONS } from '@/cms/auth'
import { getUserPermissions, isAdmin } from '@/cms/utilities/users'
import { getRegistrationSettings } from '@/lib/site-settings'

/**
 * Public user creation is allowed only for:
 * - the very first bootstrap user
 * - projects that explicitly enable self-registration in Site Settings
 *
 * Authenticated admins and user managers retain normal create access.
 */
export const canCreateUser: Access = async ({ req }) => {
  if (req.user) {
    return isAdmin(req.user) || getUserPermissions(req.user).includes(PERMISSIONS.USERS_CREATE)
  }

  const usersCount = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  if (usersCount.totalDocs === 0) {
    return true
  }

  const registration = await getRegistrationSettings()
  return registration.allowRegistration
}
