import type { Block } from 'payload'

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: {
    plural: 'Callouts',
    singular: 'Callout',
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'callout',
      options: [
        {
          label: 'Callout',
          value: 'callout',
        },
        {
          label: 'Quote',
          value: 'quote',
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'citation',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.style === 'quote',
      },
    },
  ],
}
