import type { Field } from 'payload'

export const publishingSidebarFields = (): Field[] => [
  {
    name: 'publishedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  },
]
