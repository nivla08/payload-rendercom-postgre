import type { GlobalAfterChangeHook } from 'payload'

import { syncMediaUsage } from '@/lib/media-usage'

export const syncSiteSettingsMediaUsage: GlobalAfterChangeHook = async ({ doc, previousDoc, req }) => {
  await syncMediaUsage({
    currentDoc: doc as Record<string, unknown>,
    previousDoc: (previousDoc as Record<string, unknown> | undefined) ?? undefined,
    req,
    sourceID: 'site-settings',
    sourceSlug: 'site-settings',
    sourceTitle: 'Site Settings',
    sourceType: 'global',
    trackPaths: [{ path: 'meta.image' }],
  })

  return doc
}
