import type { Block } from 'payload'

import { validateEmbedURL } from '@/cms/utilities/embed'

export const EmbedBlock: Block = {
  slug: 'embed',
  labels: {
    plural: 'Embeds',
    singular: 'Embed',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string') return 'Embed URL is required.'
        return validateEmbedURL(value)
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: '16 / 9',
      options: ['16 / 9', '4 / 3', '1 / 1', '21 / 9'],
    },
    {
      name: 'caption',
      type: 'textarea',
    },
  ],
}
