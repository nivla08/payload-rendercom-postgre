import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import {
  canAccessAdmin,
  isAdminOrHasAnyPermission,
  isAdminOrHasPermissionOrOwn,
  PERMISSIONS,
  readPublishedOrPrivileged,
} from '@/cms/access'
import { authorField } from '@/cms/fields/authorship'
import { metaFieldGroup } from '@/cms/fields/seo'
import { publishingSidebarFields } from '@/cms/fields/publishing'
import { slugField } from '@/cms/fields/slug'
import { createAuditHooks } from './hooks/createAuditHooks'
import { assignAuthor } from './hooks/assignAuthor'
import { setPublishedAt } from './hooks/setPublishedAt'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    admin: canAccessAdmin([
      PERMISSIONS.POSTS_ACCESS,
      PERMISSIONS.POSTS_CREATE,
      PERMISSIONS.POSTS_UPDATE,
      PERMISSIONS.POSTS_DELETE,
    ]),
    create: isAdminOrHasAnyPermission([PERMISSIONS.POSTS_CREATE]),
    delete: isAdminOrHasPermissionOrOwn({
      anyPermission: PERMISSIONS.POSTS_DELETE,
      ownPermission: PERMISSIONS.POSTS_DELETE_OWN,
    }),
    read: readPublishedOrPrivileged,
    update: isAdminOrHasPermissionOrOwn({
      anyPermission: PERMISSIONS.POSTS_UPDATE,
      ownPermission: PERMISSIONS.POSTS_UPDATE_OWN,
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
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
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
