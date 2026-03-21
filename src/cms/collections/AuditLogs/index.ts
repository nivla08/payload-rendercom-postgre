import type { CollectionConfig } from 'payload'

import { adminOnly, adminOnlyBoolean } from '@/cms/access'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  access: {
    admin: adminOnlyBoolean,
    create: () => false,
    delete: () => false,
    read: adminOnly,
    update: () => false,
  },
  admin: {
    useAsTitle: 'collection',
    defaultColumns: ['action', 'collection', 'docId', 'performedBy', 'createdAt'],
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      options: ['create', 'update', 'delete'],
      required: true,
    },
    {
      name: 'collection',
      type: 'text',
      required: true,
    },
    {
      name: 'docId',
      type: 'text',
      required: true,
    },
    {
      name: 'performedBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
  timestamps: true,
}
