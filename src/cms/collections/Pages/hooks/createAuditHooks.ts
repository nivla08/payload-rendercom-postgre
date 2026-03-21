import type { CollectionConfig } from 'payload'

import { writeAuditLog } from '@/cms/utilities/audit'

/**
 * Page-local audit hook builder so collection behavior lives beside the
 * collection config.
 */
export const createAuditHooks = (): Pick<CollectionConfig, 'hooks'>['hooks'] => ({
  afterChange: [
    async ({ doc, operation, req }) => {
      if (operation !== 'create' && operation !== 'update') return
      if (!doc?.id) return

      await writeAuditLog({
        action: operation,
        collection: 'pages',
        docId: doc.id,
        req,
      })
    },
  ],
  afterDelete: [
    async ({ id, req }) => {
      if (!id) return

      await writeAuditLog({
        action: 'delete',
        collection: 'pages',
        docId: id,
        req,
      })
    },
  ],
})
