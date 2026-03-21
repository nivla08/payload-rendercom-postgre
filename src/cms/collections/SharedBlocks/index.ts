import type { CollectionConfig } from 'payload'

import {
  canAccessAdmin,
  hasAnyPermission,
  isAdminOrHasPermission,
  PERMISSIONS,
  readPublishedOrPrivileged,
} from '@/cms/access'
import { PAGE_BLOCKS } from '@/cms/blocks'
import { syncSharedBlockMediaUsageAfterChange, syncSharedBlockMediaUsageAfterDelete } from './hooks/syncMediaUsage'

export const SharedBlocks: CollectionConfig = {
  slug: 'shared-blocks',
  admin: {
    hidden: ({ user }) =>
      !hasAnyPermission(user, [
        PERMISSIONS.PAGES_ACCESS,
        PERMISSIONS.PAGES_CREATE,
        PERMISSIONS.PAGES_UPDATE,
        PERMISSIONS.PAGES_DELETE,
      ]),
    useAsTitle: 'title',
  },
  access: {
    admin: canAccessAdmin([
      PERMISSIONS.PAGES_ACCESS,
      PERMISSIONS.PAGES_CREATE,
      PERMISSIONS.PAGES_UPDATE,
      PERMISSIONS.PAGES_DELETE,
    ]),
    create: isAdminOrHasPermission(PERMISSIONS.PAGES_CREATE),
    delete: isAdminOrHasPermission(PERMISSIONS.PAGES_DELETE),
    read: readPublishedOrPrivileged,
    update: isAdminOrHasPermission(PERMISSIONS.PAGES_UPDATE),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [syncSharedBlockMediaUsageAfterChange],
    afterDelete: [syncSharedBlockMediaUsageAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'block',
      type: 'blocks',
      blocks: [...PAGE_BLOCKS],
      maxRows: 1,
      minRows: 1,
      required: true,
    },
  ],
}
