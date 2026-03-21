import type { GlobalConfig } from 'payload'

import { canAccessSettings } from '@/cms/access'
import { syncSiteSettingsMediaUsage } from './hooks/syncMediaUsage'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: canAccessSettings,
  },
  hooks: {
    afterChange: [syncSiteSettingsMediaUsage],
  },
  fields: [
    {
      name: 'siteDetails',
      type: 'group',
      label: 'Site Details',
      fields: [
        {
          name: 'siteName',
          type: 'text',
          required: true,
          defaultValue: 'Payload Starter',
        },
        {
          name: 'siteUrl',
          type: 'text',
          required: true,
        },
        {
          name: 'slogan',
          type: 'text',
        },
      ],
    },
    {
      name: 'meta',
      type: 'group',
      label: 'Default Meta',
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
      ],
    },
    {
      name: 'auth',
      type: 'group',
      label: 'Auth',
      fields: [
        {
          name: 'allowRegistration',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'registrationRequiresApproval',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.allowRegistration),
          },
        },
        {
          name: 'defaultRole',
          type: 'select',
          defaultValue: 'editor',
          options: [
            {
              label: 'No Role',
              value: 'none',
            },
            {
              label: 'Editor',
              value: 'editor',
            },
          ],
          admin: {
            description:
              'Role applied to new self-registered users. Choose "No Role" to register users without an assigned role.',
            condition: (_, siblingData) => Boolean(siblingData?.allowRegistration),
          },
        },
        {
          name: 'registrationSuccessMessage',
          type: 'textarea',
          defaultValue: 'Thanks for registering. You can sign in once your account is active.',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.allowRegistration),
          },
        },
        {
          name: 'registrationRedirectURL',
          type: 'text',
          defaultValue: '/',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.allowRegistration),
          },
        },
        {
          name: 'registrationHoneypotEnabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.allowRegistration),
          },
        },
      ],
    },
    {
      name: 'maintenance',
      type: 'group',
      label: 'Maintenance',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'message',
          type: 'textarea',
          defaultValue:
            '{siteName} is currently under maintenance. We\'ll be back shortly. Thank you for your patience.',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'allowlistedPaths',
          type: 'array',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
            description:
              'Supported patterns: exact paths like /about, prefix patterns like /posts/*, or * to bypass all frontend routes.',
          },
          fields: [
            {
              name: 'path',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'bypassSecretEnabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'bypassSecret',
          type: 'text',
          admin: {
            condition: (_, siblingData) =>
              Boolean(siblingData?.enabled) && Boolean(siblingData?.bypassSecretEnabled),
          },
        },
      ],
    },
  ],
}
