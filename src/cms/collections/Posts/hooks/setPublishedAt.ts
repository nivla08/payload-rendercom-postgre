import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Keep `publishedAt` aligned with Payload draft status for posts.
 */
export const setPublishedAt: CollectionBeforeChangeHook = ({ data }) => {
  if (!data || typeof data !== 'object') return data

  const nextData = { ...(data as Record<string, unknown>) }

  if (nextData._status === 'published' && !nextData.publishedAt) {
    nextData.publishedAt = new Date().toISOString()
  }

  if (nextData._status !== 'published') {
    nextData.publishedAt = null
  }

  return nextData
}
