import { env } from '@/config/env'

type PreviewableCollection = 'pages' | 'posts'

const asSlug = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export const resolvePreviewPath = (collection: PreviewableCollection, doc: Record<string, unknown>): string | null => {
  const slug = asSlug(doc.slug)
  if (!slug) return null

  if (collection === 'pages') {
    return slug === 'home' ? '/' : `/${slug}`
  }

  return `/posts/${slug}`
}

export const buildPreviewURL = (
  collection: PreviewableCollection,
  doc: Record<string, unknown>,
  token?: null | string,
): string | null => {
  const path = resolvePreviewPath(collection, doc)
  if (!path) return null

  const params = new URLSearchParams({
    path,
    secret: env.previewSecret,
  })

  if (token) params.set('token', token)

  return `${env.publicServerUrl}/api/preview?${params.toString()}`
}
