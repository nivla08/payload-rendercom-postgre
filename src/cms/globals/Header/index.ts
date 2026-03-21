import type { Access, Field, GlobalConfig } from 'payload'

import { canAccessSettings } from '@/cms/access'
import { linkField } from '@/cms/fields/link'
import { MAX_HEADER_NAV_DEPTH } from '@/constants/navigation'

const canReadHeader: Access = ({ req }) => {
  const draftRequested = req.query?.draft === 'true' || req.query?.draft === true
  if (draftRequested) return Boolean(req.user)
  return true
}

const getChildrenFieldName = (depth: number): string => `childrenLevel${depth}`

/**
 * Recursively build a starter-safe navigation tree with a capped depth.
 *
 * The source project used explicit `childrenLevelX` fields instead of one
 * infinitely recursive shape. That keeps editor UX predictable while still
 * supporting nested menus and depth-aware rendering on the frontend.
 */
const createNavigationItemFields = (depth: number): Field[] => {
  const fields: Field[] = [
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
  ]

  if (depth < MAX_HEADER_NAV_DEPTH) {
    fields.push({
      name: getChildrenFieldName(depth),
      dbName: `header_navigation_children_level_${depth}`,
      type: 'array',
      admin: {
        description: `Nested level ${depth + 1} of ${MAX_HEADER_NAV_DEPTH}.`,
      },
      fields: createNavigationItemFields(depth + 1),
    })
  }

  if (depth === 1) {
    fields.push({
      name: 'showAsExpanded',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'If selected and this menu item has children, the first submenu level can be rendered expanded by default.',
      },
    })
  }

  return fields
}

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: canReadHeader,
    update: canAccessSettings,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Payload Starter',
    },
    {
      name: 'navigation',
      dbName: 'header_navigation',
      type: 'array',
      admin: {
        description: `Navigation supports up to ${MAX_HEADER_NAV_DEPTH} levels.`,
      },
      labels: {
        plural: 'Navigation Items',
        singular: 'Navigation Item',
      },
      fields: [
        ...createNavigationItemFields(1),
      ],
    },
  ],
}
