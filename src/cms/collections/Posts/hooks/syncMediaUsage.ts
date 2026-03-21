import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { syncMediaUsage } from '@/lib/media-usage'

const TRACK_PATHS = [
  { path: 'featuredImage' },
  { path: 'meta.image' },
]

export const syncPostMediaUsageAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (!doc?.id) return doc

  await syncMediaUsage({
    currentDoc: doc as Record<string, unknown>,
    previousDoc: (previousDoc as Record<string, unknown> | undefined) ?? undefined,
    req,
    sourceID: doc.id,
    sourceSlug: 'posts',
    sourceTitle: typeof doc.title === 'string' && doc.title.trim() ? doc.title : `Post ${doc.id}`,
    sourceType: 'collection',
    trackPaths: TRACK_PATHS,
  })

  return doc
}

export const syncPostMediaUsageAfterDelete: CollectionAfterDeleteHook = async ({ id, req }) => {
  if (!id) return

  await syncMediaUsage({
    previousDoc: undefined,
    req,
    sourceID: id,
    sourceSlug: 'posts',
    sourceTitle: `Post ${id}`,
    sourceType: 'collection',
    trackPaths: TRACK_PATHS,
  })
}
