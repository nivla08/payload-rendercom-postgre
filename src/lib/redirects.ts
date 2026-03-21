import config from '@payload-config'
import { getPayload } from 'payload'

type RedirectDocReference = {
  relationTo?: null | string
  value?: null | Record<string, unknown>
}

type RedirectTarget = {
  custom?: null | string
  reference?: RedirectDocReference
  url?: null | string
}

type RedirectRecord = {
  from?: null | string
  to?: null | RedirectTarget | string
}

type RedirectFindResult = {
  docs: RedirectRecord[]
}

type RedirectReader = {
  find: (args: {
    collection: 'redirects'
    depth?: number
    draft?: boolean
    limit?: number
    overrideAccess?: boolean
    where: {
      from: {
        equals: string
      }
    }
  }) => Promise<RedirectFindResult>
}

export type RedirectResult = {
  statusCode: 301
  to: string
}

const ROUTABLE_COLLECTIONS = new Set(['pages', 'posts'])

const normalizePath = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return '/'
  if (trimmed === '/') return '/'
  return trimmed.startsWith('/') ? trimmed.replace(/\/+$/, '') : `/${trimmed.replace(/\/+$/, '')}`
}

const readSlug = (doc: Record<string, unknown>): string => {
  const rawSlug = doc.slug
  return typeof rawSlug === 'string' ? rawSlug.trim().replace(/^\/+|\/+$/g, '') : ''
}

const resolveDocPath = (args: { collection: string; doc: Record<string, unknown> }): null | string => {
  if (!ROUTABLE_COLLECTIONS.has(args.collection)) return null

  const slug = readSlug(args.doc)
  if (!slug) return args.collection === 'pages' ? '/' : null

  if (args.collection === 'pages' && slug === 'home') {
    return '/'
  }

  return args.collection === 'pages' ? `/${slug}` : `/${args.collection}/${slug}`
}

const resolveRedirectDestination = (target: RedirectRecord['to']): null | string => {
  if (!target) return null

  if (typeof target === 'string' && target.trim()) {
    return target.trim()
  }

  if (typeof target === 'string') {
    return null
  }

  const objectTarget = target as RedirectTarget

  if (typeof objectTarget.url === 'string' && objectTarget.url.trim()) {
    return objectTarget.url.trim()
  }

  if (typeof objectTarget.custom === 'string' && objectTarget.custom.trim()) {
    return objectTarget.custom.trim()
  }

  const relationTo = objectTarget.reference?.relationTo
  const referenceValue = objectTarget.reference?.value
  if (!relationTo || !referenceValue) return null

  return resolveDocPath({
    collection: relationTo,
    doc: referenceValue,
  })
}

/**
 * Read a manually managed redirect from the Payload redirects plugin collection.
 *
 * This is intended for route-miss handling:
 * 1. try to resolve content by path
 * 2. if nothing matches, call `findRedirectByPath`
 * 3. redirect if found, otherwise 404
 */
export const findRedirectByPath = async (path: string, options: { draft?: boolean } = {}): Promise<null | RedirectResult> => {
  const payload = await getPayload({ config })
  const redirectReader = payload as unknown as RedirectReader

  const result = await redirectReader.find({
    collection: 'redirects',
    depth: 1,
    draft: options.draft ?? false,
    limit: 1,
    overrideAccess: options.draft ?? false,
    where: {
      from: {
        equals: normalizePath(path),
      },
    },
  })

  const redirect = result.docs[0]
  const destination = resolveRedirectDestination(redirect?.to)
  if (!destination) return null

  return {
    statusCode: 301,
    to: destination,
  }
}
