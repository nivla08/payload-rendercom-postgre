import { MAX_HEADER_NAV_DEPTH } from '@/constants/navigation'

type LinkType = 'custom' | 'internal'

type LinkReferenceDoc = {
  slug?: null | string
}

type PolymorphicReference = {
  value?: LinkReferenceDoc | null | number | string
}

type LinkValue = {
  appearance?: null | string
  label?: null | string
  newTab?: boolean | null
  reference?: LinkReferenceDoc | null | number | PolymorphicReference | string
  type?: LinkType | null
  url?: null | string
}

type LinkItem = {
  childrenLevel1?: LinkItem[] | null
  childrenLevel2?: LinkItem[] | null
  childrenLevel3?: LinkItem[] | null
  childrenLevel4?: LinkItem[] | null
  id?: unknown
  _uuid?: unknown
  label?: null | string
  link?: LinkValue | null
  [key: string]: unknown
}

type HeaderDoc = {
  navigation?: LinkItem[] | null
  siteName?: null | string
}

type FooterColumn = {
  links?: LinkItem[] | null
  title?: null | string
}

type FooterDoc = {
  columns?: FooterColumn[] | null
  description?: null | string
  legal?: {
    copyright?: null | string
  } | null
  socialLinks?: LinkItem[] | null
  tagline?: null | string
}

export type LinkDTO = {
  appearance?: string
  children?: LinkDTO[]
  href: string
  label: string
  level: number
  menuLinkUUID?: string
  menuUUID?: string
  newTab?: boolean
}

export type HeaderDTO = {
  navigation: LinkDTO[]
  siteName: string
}

export type FooterDTO = {
  columns: {
    links: LinkDTO[]
    title: string
  }[]
  description: string
  legal: {
    copyright: string
  }
  socialLinks: LinkDTO[]
  tagline: string
}

export const EMPTY_HEADER: HeaderDTO = {
  navigation: [],
  siteName: 'Payload Starter',
}

export const EMPTY_FOOTER: FooterDTO = {
  columns: [],
  description: '',
  legal: {
    copyright: '',
  },
  socialLinks: [],
  tagline: '',
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const getReferenceSlug = (reference: LinkValue['reference']): null | string => {
  if (!reference) return null

  if (isRecord(reference) && 'slug' in reference && typeof reference.slug === 'string') {
    return reference.slug.trim() || null
  }

  if (isRecord(reference) && 'value' in reference) {
    const nested = reference.value
    if (isRecord(nested) && typeof nested.slug === 'string') {
      return nested.slug.trim() || null
    }
  }

  return null
}

const resolveHref = (link: LinkValue | null | undefined): null | string => {
  if (!link) return null

  if (link.type === 'custom') {
    const url = typeof link.url === 'string' ? link.url.trim() : ''
    return url || null
  }

  if (link.type === 'internal') {
    const slug = getReferenceSlug(link.reference)
    if (!slug) return null
    return slug.startsWith('/') ? slug : `/${slug}`
  }

  return null
}

const resolveMenuUUID = (item: LinkItem): string | undefined => {
  if (typeof item.id === 'string' && item.id.trim().length > 0) return item.id
  if (typeof item._uuid === 'string' && item._uuid.trim().length > 0) return item._uuid
  return undefined
}

const isUUID = (value: string): boolean => {
  const candidate = value.trim()
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
}

/**
 * Converts nested Payload menu rows into a stable frontend DTO. This keeps
 * frontend rendering independent from raw global document shape changes.
 */
export const buildLinks = (
  items: LinkItem[] | null | undefined,
  depth = 1,
  maxDepth = MAX_HEADER_NAV_DEPTH,
): LinkDTO[] => {
  if (!Array.isArray(items)) return []

  return items
    .map((item) => {
      const href = resolveHref(item.link)
      if (!href) return null

      const childrenFieldName = `childrenLevel${depth}`
      const childItems = item[childrenFieldName]
      const nestedChildren =
        depth < maxDepth && Array.isArray(childItems)
          ? buildLinks(childItems as LinkItem[], depth + 1, maxDepth)
          : []

      const label =
        (typeof item.link?.label === 'string' && item.link.label.trim()) ||
        (typeof item.label === 'string' && item.label.trim()) ||
        href

      const mapped: LinkDTO = {
        href,
        label,
        level: depth,
      }

      const menuUUID = resolveMenuUUID(item)
      if (item.link?.newTab) mapped.newTab = true
      if (menuUUID) {
        mapped.menuUUID = menuUUID
        if (isUUID(menuUUID)) mapped.menuLinkUUID = menuUUID
      }
      if (typeof item.link?.appearance === 'string' && item.link.appearance.trim()) {
        mapped.appearance = item.link.appearance
      }
      if (nestedChildren.length > 0) mapped.children = nestedChildren

      return mapped
    })
    .filter((item): item is LinkDTO => Boolean(item))
}

export const toHeaderDTO = (headerDoc: HeaderDoc): HeaderDTO => ({
  navigation: buildLinks(headerDoc.navigation),
  siteName: headerDoc.siteName?.trim() || EMPTY_HEADER.siteName,
})

export const toFooterDTO = (footerDoc: FooterDoc): FooterDTO => ({
  columns: Array.isArray(footerDoc.columns)
    ? footerDoc.columns.map((column) => ({
        links: buildLinks(column.links),
        title: column.title?.trim() || '',
      }))
    : [],
  description: footerDoc.description?.trim() || '',
  legal: {
    copyright: footerDoc.legal?.copyright?.trim() || '',
  },
  socialLinks: buildLinks(footerDoc.socialLinks),
  tagline: footerDoc.tagline?.trim() || '',
})
