import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { syncMediaUsage } from '@/lib/media-usage'

const TRACK_PATHS = [{ mode: 'deep' as const, path: 'block' }]

export const syncSharedBlockMediaUsageAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (!doc?.id) return doc

  await syncMediaUsage({
    currentDoc: doc as Record<string, unknown>,
    previousDoc: (previousDoc as Record<string, unknown> | undefined) ?? undefined,
    req,
    sourceID: doc.id,
    sourceSlug: 'shared-blocks',
    sourceTitle: typeof doc.title === 'string' && doc.title.trim() ? doc.title : `Shared Block ${doc.id}`,
    sourceType: 'collection',
    trackPaths: TRACK_PATHS,
  })

  return doc
}

export const syncSharedBlockMediaUsageAfterDelete: CollectionAfterDeleteHook = async ({ id, req }) => {
  if (!id) return

  await syncMediaUsage({
    previousDoc: undefined,
    req,
    sourceID: id,
    sourceSlug: 'shared-blocks',
    sourceTitle: `Shared Block ${id}`,
    sourceType: 'collection',
    trackPaths: TRACK_PATHS,
  })
}
