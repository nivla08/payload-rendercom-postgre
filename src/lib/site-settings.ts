import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

const DEFAULT_MAINTENANCE_MESSAGE =
  'This site is currently under maintenance. We\'ll be back shortly. Thank you for your patience.'
const DEFAULT_MAINTENANCE_TEMPLATE =
  '{siteName} is currently under maintenance. We\'ll be back shortly. Thank you for your patience.'
const DEFAULT_REGISTRATION_SUCCESS_MESSAGE =
  'Thanks for registering. You can sign in once your account is active.'
const DEFAULT_REGISTRATION_REDIRECT_URL = '/'

type MediaLike = {
  url?: null | string
}

type MaintenancePathRow = {
  path?: null | string
}

type RegistrationRole = 'editor' | 'none'

type SiteSettingsDoc = {
  auth?: {
    allowRegistration?: boolean | null
    defaultRole?: null | RegistrationRole
    registrationHoneypotEnabled?: boolean | null
    registrationRedirectURL?: null | string
    registrationRequiresApproval?: boolean | null
    registrationSuccessMessage?: null | string
  } | null
  maintenance?: {
    allowlistedPaths?: MaintenancePathRow[] | null
    bypassSecret?: null | string
    bypassSecretEnabled?: boolean | null
    enabled?: boolean | null
    message?: null | string
  } | null
  meta?: {
    description?: null | string
    image?: MediaLike | null | number | string
    title?: null | string
  } | null
  siteDetails?: {
    siteName?: null | string
    siteUrl?: null | string
    slogan?: null | string
  } | null
}

export type ResolvedSiteSettings = {
  auth: {
    allowRegistration: boolean
    defaultRole: 'editor' | null
    registrationHoneypotEnabled: boolean
    registrationRedirectURL: string
    registrationRequiresApproval: boolean
    registrationSuccessMessage: string
  }
  maintenance: {
    allowlistedPaths: string[]
    bypassSecret: null | string
    bypassSecretEnabled: boolean
    enabled: boolean
    message: string
  }
  meta: {
    description: string
    image: MediaLike | null | number | string
    title: string
  }
  siteDetails: {
    siteName: string
    siteUrl: string
    slogan: string
  }
}

const asNonEmptyString = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

const normalizePath = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed === '/') return '/'
  return trimmed.startsWith('/') ? trimmed.replace(/\/+$/, '') : `/${trimmed.replace(/\/+$/, '')}`
}

const normalizeMaintenancePathPattern = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed === '*') return '*'

  if (trimmed.endsWith('/*')) {
    const base = normalizePath(trimmed.slice(0, -2))
    if (!base || base === '/') return '/*'
    return `${base}/*`
  }

  return normalizePath(trimmed)
}

const resolveMaintenanceMessage = (input: { siteName?: null | string; template?: null | string }): string => {
  const siteName = typeof input.siteName === 'string' ? input.siteName.trim() : ''
  const rawTemplate =
    typeof input.template === 'string' && input.template.trim().length > 0
      ? input.template.trim()
      : DEFAULT_MAINTENANCE_TEMPLATE

  const withSiteName = siteName
    ? rawTemplate.replaceAll('{siteName}', siteName)
    : rawTemplate.replaceAll('{siteName}', 'This site')

  return withSiteName.trim() || DEFAULT_MAINTENANCE_MESSAGE
}

/**
 * Supported patterns:
 * - `*` for all frontend routes
 * - exact paths like `/about`
 * - prefix patterns like `/posts/*`
 *
 * Existing plain paths such as `/posts` still bypass `/posts/my-slug` to keep the
 * original starter behavior ergonomic for collection-style route sections.
 */
export const matchesMaintenancePath = (pathname: string, allowlistedPath: string): boolean => {
  if (!allowlistedPath) return false
  if (allowlistedPath === '*') return true
  if (allowlistedPath === '/*') return true
  if (pathname === allowlistedPath) return true

  if (allowlistedPath.endsWith('/*')) {
    const prefix = allowlistedPath.slice(0, -2)
    if (!prefix) return true
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  }

  return allowlistedPath !== '/' && pathname.startsWith(`${allowlistedPath}/`)
}

const loadSiteSettings = cache(async (): Promise<ResolvedSiteSettings> => {
  const payload = await getPayload({ config })

  let raw: null | SiteSettingsDoc = null

  try {
    raw = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
      overrideAccess: true,
    })) as SiteSettingsDoc
  } catch {
    raw = null
  }

  const siteName = asNonEmptyString(raw?.siteDetails?.siteName, 'Payload Starter')

  return {
    auth: {
      allowRegistration: Boolean(raw?.auth?.allowRegistration),
      defaultRole: raw?.auth?.defaultRole === 'editor' ? 'editor' : null,
      registrationHoneypotEnabled: raw?.auth?.registrationHoneypotEnabled !== false,
      registrationRedirectURL: asNonEmptyString(
        raw?.auth?.registrationRedirectURL,
        DEFAULT_REGISTRATION_REDIRECT_URL,
      ),
      registrationRequiresApproval: Boolean(raw?.auth?.registrationRequiresApproval),
      registrationSuccessMessage: asNonEmptyString(
        raw?.auth?.registrationSuccessMessage,
        DEFAULT_REGISTRATION_SUCCESS_MESSAGE,
      ),
    },
    maintenance: {
      allowlistedPaths:
        raw?.maintenance?.allowlistedPaths
          ?.map((row) => normalizeMaintenancePathPattern(row?.path || ''))
          .filter((path): path is string => Boolean(path)) ?? [],
      bypassSecret: asNonEmptyString(raw?.maintenance?.bypassSecret, '') || null,
      bypassSecretEnabled: Boolean(raw?.maintenance?.bypassSecretEnabled),
      enabled: Boolean(raw?.maintenance?.enabled),
      message: resolveMaintenanceMessage({
        siteName,
        template: raw?.maintenance?.message,
      }),
    },
    meta: {
      description: asNonEmptyString(raw?.meta?.description),
      image: raw?.meta?.image ?? null,
      title: asNonEmptyString(raw?.meta?.title),
    },
    siteDetails: {
      siteName,
      siteUrl: asNonEmptyString(raw?.siteDetails?.siteUrl),
      slogan: asNonEmptyString(raw?.siteDetails?.slogan),
    },
  }
})

export const getSiteSettings = async (): Promise<ResolvedSiteSettings> => {
  return loadSiteSettings()
}

/**
 * Narrow helper for user-registration policy checks.
 *
 * Useful in collection access and hooks where callers only need auth settings
 * and should not care about site meta or maintenance data.
 */
export const getRegistrationSettings = async (): Promise<ResolvedSiteSettings['auth']> => {
  const settings = await getSiteSettings()
  return settings.auth
}
