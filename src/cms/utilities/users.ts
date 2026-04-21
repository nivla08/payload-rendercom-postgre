import type { Permission, Role } from '@/cms/auth'
import { ROLE_PRESETS, ROLES } from '@/cms/auth'

export type AuthUser = {
  id?: number | string
  roles?: null | string[]
  status?: null | string
}

const asStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string')
}

export const getUserRoles = (user: unknown): Role[] => {
  if (!user || typeof user !== 'object') return []

  return asStringList((user as AuthUser).roles).filter(
    (role): role is Role => Object.values(ROLES).includes(role as Role),
  )
}

export const getUserPermissions = (user: unknown): Permission[] => {
  if (!user || typeof user !== 'object') return []

  const authUser = user as AuthUser
  const fromRoles = getUserRoles(authUser).flatMap((role) => ROLE_PRESETS[role] ?? [])

  return [...new Set(fromRoles)]
}

export const isSuperAdmin = (user: unknown): boolean => {
  return getUserRoles(user).includes(ROLES.SUPER_ADMIN)
}

export const isAdmin = (user: unknown): boolean => {
  const roles = getUserRoles(user)
  return roles.includes(ROLES.SUPER_ADMIN) || roles.includes(ROLES.ADMIN)
}
