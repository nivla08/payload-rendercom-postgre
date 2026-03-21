import type { Field } from 'payload'

import { slugify } from '@/cms/utilities/slug'

export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    description: `Defaults from "${sourceField}" but remains editable.`,
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [
      ({ data, value }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)

        const source = data && typeof data === 'object' ? (data as Record<string, unknown>)[sourceField] : undefined
        if (typeof source !== 'string') return value

        return slugify(source)
      },
    ],
  },
})
