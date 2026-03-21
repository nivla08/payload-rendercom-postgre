import type { Field } from 'payload'

/**
 * Source-aligned SEO field group. The document field is named `meta` so frontend
 * metadata utilities can consume a consistent shape across collections.
 */
export const metaFieldGroup = (): Field => ({
  name: 'meta',
  type: 'group',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
})

export const seoFieldGroup = metaFieldGroup
