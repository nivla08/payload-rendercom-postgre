import { APIError, type CollectionBeforeChangeHook, type PayloadRequest } from 'payload'

import { ROLES } from '@/cms/auth'
import { getUserRoles, isAdmin } from '@/cms/utilities/users'
import { getRegistrationSettings } from '@/lib/site-settings'

const countSuperAdmins = async (req: PayloadRequest): Promise<number> => {
  const result = await req.payload.find({
    collection: 'users',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      roles: {
        contains: ROLES.SUPER_ADMIN,
      },
    },
  })

  return result.docs.length
}

const readComparableID = (value: unknown): null | number | string => {
  if (typeof value === 'string' || typeof value === 'number') return value
  return null
}

const sanitizeManagedFields = (data: Record<string, unknown>): Record<string, unknown> => {
  const nextData = { ...data }

  if (!Array.isArray(nextData.roles) || nextData.roles.length === 0) {
    nextData.roles = [ROLES.EDITOR]
  }

  if (typeof nextData.status !== 'string' || !nextData.status) {
    nextData.status = 'active'
  }

  if (!Array.isArray(nextData.permissions)) {
    nextData.permissions = []
  }

  return nextData
}

const sanitizePublicRegistration = async (data: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const registration = await getRegistrationSettings()

  if (!registration.allowRegistration) {
    throw new APIError('Registration is currently disabled.', 403)
  }

  return {
    ...data,
    permissions: [],
    roles: registration.defaultRole ? [registration.defaultRole] : [],
    status: registration.registrationRequiresApproval ? 'blocked' : 'active',
    _verificationToken: null,
    _verified: false,
  }
}

/**
 * Central user lifecycle rules:
 * - bootstrap the first user as super-admin
 * - preserve safe defaults
 * - prevent self-service privilege escalation or removing the last super-admin
 */
export const beforeChange: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req }) => {
  if (!data || typeof data !== 'object') return data

  const baseData = data as Record<string, unknown>
  const usersTotal = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  if (operation === 'create' && usersTotal.totalDocs === 0) {
    return {
      ...baseData,
      permissions: [],
      roles: [ROLES.SUPER_ADMIN],
      status: 'active',
      _verificationToken: null,
      _verified: true,
    }
  }

  if (operation === 'create' && !req.user) {
    return sanitizePublicRegistration(baseData)
  }

  const nextData = sanitizeManagedFields(baseData)

  if (operation === 'create' && req.user && isAdmin(req.user)) {
    nextData._verificationToken = null
    nextData._verified = true
  }

  if (operation === 'update' && originalDoc && typeof originalDoc === 'object') {
    const originalRoles = getUserRoles(originalDoc)
    const incomingRoles = Array.isArray(nextData.roles) ? nextData.roles : []
    const originalId = readComparableID((originalDoc as { id?: unknown }).id)
    const currentId = readComparableID(req.user?.id)
    const isEditingSelf = originalId != null && currentId != null && originalId === currentId

    if (originalRoles.includes(ROLES.SUPER_ADMIN) && !incomingRoles.includes(ROLES.SUPER_ADMIN)) {
      const totalSuperAdmins = await countSuperAdmins(req)
      if (totalSuperAdmins <= 1) {
        throw new APIError('The last super-admin cannot lose super-admin access.', 400)
      }
    }

    if (!isAdmin(req.user) && isEditingSelf) {
      delete nextData.roles
      delete nextData.permissions
      delete nextData.status
      delete nextData.deletionStrategy
      delete nextData.reassignOwnedContentTo
      delete nextData._verified
      delete nextData._verificationToken
    }
  }

  return nextData
}
