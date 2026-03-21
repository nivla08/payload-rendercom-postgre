import type { Metadata } from 'next'

type SiteMetadataDefaults = {
  description?: string
  image?: unknown
  title?: string
}

const ENTITY_MAP: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

const decodeHtmlEntities = (value: string): string => {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, token: string) => {
    const key = token.toLowerCase()

    if (key.startsWith('#x')) {
      const code = Number.parseInt(key.slice(2), 16)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }

    if (key.startsWith('#')) {
      const code = Number.parseInt(key.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }

    return ENTITY_MAP[key] ?? match
  })
}

const stripHtmlTags = (value: string): string => value.replace(/<[^>]*>/g, ' ')

export const toPlainText = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') return fallback

  const normalized = decodeHtmlEntities(stripHtmlTags(value))
    .replace(/\s+/g, ' ')
    .trim()

  return normalized || fallback
}

const DEFAULT_META_IMAGE = '/logo.svg'

const resolveImageUrl = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) return value.trim()

  if (value && typeof value === 'object') {
    const maybeUrl = (value as { url?: unknown }).url
    if (typeof maybeUrl === 'string' && maybeUrl.trim()) return maybeUrl.trim()
  }

  return DEFAULT_META_IMAGE
}

type BuildMetadataArgs = {
  defaults?: SiteMetadataDefaults
  description?: unknown
  fallbackDescription?: string
  fallbackTitle: string
  image?: unknown
  noindex?: unknown
  title: unknown
  type?: 'article' | 'website'
}

/**
 * Starter metadata helper:
 * collection-level meta wins first, then site-settings defaults, then the
 * content-derived fallback values.
 */
export const buildPageMetadata = ({
  defaults,
  description,
  fallbackDescription,
  fallbackTitle,
  image,
  noindex,
  title,
  type = 'website',
}: BuildMetadataArgs): Metadata => {
  const siteDefaultTitle = toPlainText(defaults?.title, fallbackTitle)
  const siteDefaultDescription = toPlainText(defaults?.description, fallbackDescription ?? `Read ${fallbackTitle}`)

  const safeTitle = toPlainText(title, siteDefaultTitle)
  const safeDescription = toPlainText(description, siteDefaultDescription)
  const imageUrl = resolveImageUrl(image ?? defaults?.image)
  const shouldNoindex = Boolean(noindex)

  return {
    title: safeTitle,
    description: safeDescription,
    robots: {
      follow: !shouldNoindex,
      index: !shouldNoindex,
    },
    openGraph: {
      description: safeDescription,
      images: [
        {
          alt: safeTitle,
          url: imageUrl,
        },
      ],
      title: safeTitle,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      description: safeDescription,
      images: [imageUrl],
      title: safeTitle,
    },
  }
}
