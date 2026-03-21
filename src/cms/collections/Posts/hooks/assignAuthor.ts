import type { CollectionBeforeChangeHook } from 'payload'

import { isAdmin } from '@/cms/utilities/users'

/**
 * Auto-assign the current user as `author` on create and preserve ownership for
 * non-admin updates.
 */
export const assignAuthor: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  if (!data || typeof data !== 'object') return data
  if (!req.user?.id) return data

  const nextData = { ...(data as Record<string, unknown>) }

  if (operation === 'create' && !nextData.author) {
    nextData.author = req.user.id
    return nextData
  }

  if (!isAdmin(req.user) && operation === 'update' && originalDoc && typeof originalDoc === 'object') {
    nextData.author = (originalDoc as { author?: unknown }).author
  }

  return nextData
}
