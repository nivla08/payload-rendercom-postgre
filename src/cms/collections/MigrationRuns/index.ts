import type { CollectionConfig } from 'payload'

import { adminOnly, adminOnlyBoolean } from '@/cms/access'

export const MigrationRuns: CollectionConfig = {
  slug: 'migration-runs',
  access: {
    admin: adminOnlyBoolean,
    create: () => false,
    delete: () => false,
    read: adminOnly,
    update: () => false,
  },
  admin: {
    useAsTitle: 'migrationId',
    defaultColumns: ['migrationId', 'status', 'executedAt'],
  },
  fields: [
    {
      name: 'migrationId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['completed', 'failed'],
      required: true,
    },
    {
      name: 'executedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
