import configPromise from '@payload-config'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import { cache } from 'react'

import { EMPTY_FOOTER, EMPTY_HEADER, toFooterDTO, toHeaderDTO, type FooterDTO, type HeaderDTO } from '@/lib/navigation'
import { resolveReusableBlocks } from '@/lib/resolve-reusable-blocks'

type QueryOptions = {
  draft?: boolean
}

type ContentDoc = Record<string, unknown>

type PaginatedContentResult = {
  docs: ContentDoc[]
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
  page: number
  totalDocs: number
  totalPages: number
}

const getPayloadClient = cache(async () => {
  const config = await configPromise
  return getPayload({ config })
})

const loadHeader = cache(async (draft: boolean): Promise<HeaderDTO> => {
  const payload = await getPayloadClient()

  try {
    const header = await payload.findGlobal({
      depth: 2,
      draft,
      overrideAccess: false,
      slug: 'header',
    })

    return toHeaderDTO(header as Parameters<typeof toHeaderDTO>[0])
  } catch {
    return EMPTY_HEADER
  }
})

const loadFooter = cache(async (draft: boolean): Promise<FooterDTO> => {
  const payload = await getPayloadClient()

  try {
    const footer = await payload.findGlobal({
      depth: 2,
      draft,
      overrideAccess: false,
      slug: 'footer',
    })

    return toFooterDTO(footer as Parameters<typeof toFooterDTO>[0])
  } catch {
    return EMPTY_FOOTER
  }
})

/**
 * Starter helper for consuming the header global from frontend code without
 * leaking the raw Payload document shape into UI components.
 */
export const getHeader = async (options: QueryOptions = {}): Promise<HeaderDTO> => {
  const { draft = false } = options
  return loadHeader(draft)
}

/**
 * Starter helper for consuming the footer global from frontend code without
 * coupling rendering code to the CMS document structure.
 */
export const getFooter = async (options: QueryOptions = {}): Promise<FooterDTO> => {
  const { draft = false } = options
  return loadFooter(draft)
}

export const getSiteChrome = async (options: QueryOptions = {}): Promise<{
  footer: FooterDTO
  header: HeaderDTO
}> => {
  const [header, footer] = await Promise.all([getHeader(options), getFooter(options)])

  return {
    footer,
    header,
  }
}

const normalizePath = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return trimmed.startsWith('/') ? trimmed.replace(/\/+$/, '') : `/${trimmed.replace(/\/+$/, '')}`
}

const buildWhereWithStatus = (field: 'slug', value: string, draft: boolean): Where => {
  const fieldWhere: Where = {
    [field]: {
      equals: value,
    },
  }

  if (draft) {
    return fieldWhere
  }

  return {
    and: [
      fieldWhere,
      {
        _status: {
          equals: 'published',
        },
      },
    ],
  }
}

const loadPageBySlug = cache(async (slug: string, draft: boolean): Promise<ContentDoc | null> => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    where: buildWhereWithStatus('slug', slug, draft),
  })

  const page = ((result.docs[0] as unknown) as ContentDoc | undefined) ?? null
  if (!page) return null

  page.layout = await resolveReusableBlocks({
    blocks: page.layout as Array<Record<string, unknown>>,
    draft,
    payload,
  })

  return page
})

const loadPostBySlug = cache(async (slug: string, draft: boolean): Promise<ContentDoc | null> => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    where: buildWhereWithStatus('slug', slug, draft),
  })

  return ((result.docs[0] as unknown) as ContentDoc | undefined) ?? null
})

export const getPageBySlug = async (slug: string, options: QueryOptions = {}): Promise<ContentDoc | null> => {
  return loadPageBySlug(slug, options.draft ?? false)
}

export const getPostBySlug = async (slug: string, options: QueryOptions = {}): Promise<ContentDoc | null> => {
  return loadPostBySlug(slug, options.draft ?? false)
}

export const resolvePageByPath = async (path: string, options: QueryOptions = {}): Promise<ContentDoc | null> => {
  const normalizedPath = normalizePath(path)
  if (normalizedPath === '/') return null

  const slug = normalizedPath.replace(/^\/+/, '')
  return getPageBySlug(slug, options)
}

export const listPosts = async (
  args: { limit?: number; page?: number } & QueryOptions = {},
): Promise<PaginatedContentResult> => {
  const payload = await getPayloadClient()
  const { draft = false, limit = 10, page = 1 } = args

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    draft,
    limit,
    overrideAccess: draft,
    page,
    sort: '-publishedAt',
    where: draft
      ? undefined
      : {
          _status: {
            equals: 'published',
          },
        },
  })

  return result as unknown as PaginatedContentResult
}

export const listPages = async (
  args: { limit?: number; page?: number } & QueryOptions = {},
): Promise<PaginatedContentResult> => {
  const payload = await getPayloadClient()
  const { draft = false, limit = 10, page = 1 } = args

  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    draft,
    limit,
    overrideAccess: draft,
    page,
    sort: 'title',
    where: draft
      ? {
          slug: {
            not_equals: 'home',
          },
        }
      : {
          and: [
            {
              _status: {
                equals: 'published',
              },
            },
            {
              slug: {
                not_equals: 'home',
              },
            },
          ],
        },
  })

  return result as unknown as PaginatedContentResult
}
