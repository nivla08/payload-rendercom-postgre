import type { Block } from 'payload'

import { linkField } from '@/cms/fields/link'

export const CTABlock: Block = {
  slug: 'cta',
  labels: {
    plural: 'CTAs',
    singular: 'CTA',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'copy',
      type: 'textarea',
    },
    {
      name: 'actions',
      type: 'array',
      maxRows: 2,
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        linkField({
          name: 'link',
          relationTo: ['pages', 'posts'],
          required: true,
          showAppearance: false,
        }),
      ],
    },
  ],
}
