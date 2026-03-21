import type { Field } from 'payload'

export const authorField = (): Field => ({
  name: 'author',
  type: 'relationship',
  relationTo: 'users',
  admin: {
    position: 'sidebar',
  },
})
