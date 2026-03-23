import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'media',
  labels: {
    plural: 'Media Blocks',
    singular: 'Media Block',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'center',
      options: ['left', 'center', 'right', 'full'],
    },
  ],
}
