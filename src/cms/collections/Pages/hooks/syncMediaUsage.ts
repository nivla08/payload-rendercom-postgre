import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { syncMediaUsage } from '@/lib/media-usage'

const TRACK_PATHS = [
  { path: 'meta.image' },
  { mode: 'deep' as const, path: 'layout' },
]

export const syncPageMediaUsageAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (!doc?.id) return doc

  await syncMediaUsage({
    currentDoc: doc as Record<string, unknown>,
    previousDoc: (previousDoc as Record<string, unknown> | undefined) ?? undefined,
    req,
    sourceID: doc.id,
    sourceSlug: 'pages',
    sourceTitle: typeof doc.title === 'string' && doc.title.trim() ? doc.title : `Page ${doc.id}`,
    sourceType: 'collection',
    trackPaths: TRACK_PATHS,
  })

  return doc
}

export const syncPageMediaUsageAfterDelete: CollectionAfterDeleteHook = async ({ id, req }) => {
  if (!id) return

  await syncMediaUsage({
    previousDoc: undefined,
    req,
    sourceID: id,
    sourceSlug: 'pages',
    sourceTitle: `Page ${id}`,
    sourceType: 'collection',
    trackPaths: TRACK_PATHS,
  })
}
