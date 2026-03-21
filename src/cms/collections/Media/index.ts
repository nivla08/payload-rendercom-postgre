import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import {
  canAccessAdmin,
  isAdminOrHasAnyPermission,
  isAdminOrHasPermissionOrOwn,
  PERMISSIONS,
  readPublishedOrPrivileged,
} from '@/cms/access'
import { env } from '@/config/env'
import { setUploadedBy } from './hooks/setUploadedBy'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    admin: canAccessAdmin([
      PERMISSIONS.MEDIA_ACCESS,
      PERMISSIONS.MEDIA_CREATE,
      PERMISSIONS.MEDIA_UPDATE,
      PERMISSIONS.MEDIA_DELETE,
    ]),
    create: isAdminOrHasAnyPermission([PERMISSIONS.MEDIA_CREATE]),
    delete: isAdminOrHasPermissionOrOwn({
      anyPermission: PERMISSIONS.MEDIA_DELETE,
      ownPermission: PERMISSIONS.MEDIA_DELETE_OWN,
      ownerField: 'uploadedBy',
    }),
    read: readPublishedOrPrivileged,
    update: isAdminOrHasPermissionOrOwn({
      anyPermission: PERMISSIONS.MEDIA_UPDATE,
      ownPermission: PERMISSIONS.MEDIA_UPDATE_OWN,
      ownerField: 'uploadedBy',
    }),
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [setUploadedBy],
      },
    },
  ],
  upload: {
    disableLocalStorage: env.storageProvider !== 'local',
    imageSizes: [
      {
        name: 'card',
        width: 768,
        height: 512,
      },
      {
        name: 'social',
        width: 1200,
        height: 630,
      },
    ],
    mimeTypes: ['image/*'],
    staticDir: path.resolve(dirname, `../../${env.mediaDir}`),
  },
}
