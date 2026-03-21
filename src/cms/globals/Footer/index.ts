import type { Access, GlobalConfig } from 'payload'

import { canAccessSettings } from '@/cms/access'
import { linkField } from '@/cms/fields/link'

const canReadFooter: Access = ({ req }) => {
  const draftRequested = req.query?.draft === 'true' || req.query?.draft === true
  if (draftRequested) return Boolean(req.user)
  return true
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: canReadFooter,
    update: canAccessSettings,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'columns',
      dbName: 'footer_columns',
      type: 'array',
      labels: {
        plural: 'Footer Columns',
        singular: 'Footer Column',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          dbName: 'footer_column_links',
          type: 'array',
          labels: {
            plural: 'Links',
            singular: 'Link',
          },
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
    },
    {
      name: 'socialLinks',
      dbName: 'footer_social_links',
      type: 'array',
      labels: {
        plural: 'Social Links',
        singular: 'Social Link',
      },
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
    {
      name: 'legal',
      type: 'group',
      fields: [
        {
          name: 'copyright',
          type: 'text',
        },
      ],
    },
  ],
}
