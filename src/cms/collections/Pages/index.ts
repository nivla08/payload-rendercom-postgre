import type { CollectionConfig } from 'payload'

import {
  canAccessAdmin,
  isAdminOrHasAnyPermission,
  isAdminOrHasPermissionOrOwn,
  PERMISSIONS,
  readPublishedOrPrivileged,
} from '@/cms/access'
import { PAGE_BLOCKS } from '@/cms/blocks'
import { authorField } from '@/cms/fields/authorship'
import { metaFieldGroup } from '@/cms/fields/seo'
import { publishingSidebarFields } from '@/cms/fields/publishing'
import { slugField } from '@/cms/fields/slug'
import { createAuditHooks } from './hooks/createAuditHooks'
import { assignAuthor } from './hooks/assignAuthor'
import { setPublishedAt } from './hooks/setPublishedAt'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    admin: canAccessAdmin([
      PERMISSIONS.PAGES_ACCESS,
      PERMISSIONS.PAGES_CREATE,
      PERMISSIONS.PAGES_UPDATE,
      PERMISSIONS.PAGES_DELETE,
    ]),
    create: isAdminOrHasAnyPermission([PERMISSIONS.PAGES_CREATE]),
    delete: isAdminOrHasPermissionOrOwn({
      anyPermission: PERMISSIONS.PAGES_DELETE,
      ownPermission: PERMISSIONS.PAGES_DELETE_OWN,
    }),
    read: readPublishedOrPrivileged,
    update: isAdminOrHasPermissionOrOwn({
      anyPermission: PERMISSIONS.PAGES_UPDATE,
      ownPermission: PERMISSIONS.PAGES_UPDATE_OWN,
    }),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    ...publishingSidebarFields(),
    authorField(),
    {
      name: 'layout',
      type: 'blocks',
      blocks: [...PAGE_BLOCKS],
    },
    metaFieldGroup(),
  ],
  hooks: {
    ...createAuditHooks(),
    beforeChange: [assignAuthor, setPublishedAt],
  },
  versions: {
    drafts: true,
  },
}
