import { generateExpiredPayloadCookie, headersWithCors, logoutOperation, type CollectionConfig } from 'payload'

import { adminOnlyBoolean, canCreateUser, hasAnyPermission, hasPermission, ownByField, PERMISSIONS } from '@/cms/access'
import { ROLES, ROLE_VALUES } from '@/cms/auth'
import { env } from '@/config/env'
import { renderPasswordResetEmail, renderVerifyEmail } from '@/cms/email/templates'
import { isAdmin } from '@/cms/utilities/users'
import { beforeChange } from './hooks/beforeChange'
import { beforeDelete } from './hooks/beforeDelete'
import { enforceActiveUserLogin } from './hooks/enforceActiveUserLogin'

const selfAccess = ownByField('id')
const showPrivilegedUserFields = (
  _data: unknown,
  _siblingData: unknown,
  context: { user?: unknown },
): boolean => isAdmin(context.user)

export const Users: CollectionConfig = {
  slug: 'users',
  endpoints: [
    {
      path: '/logout',
      method: 'post',
      handler: async (req) => {
        const headers = headersWithCors({
          headers: new Headers(),
          req,
        })

        const expiredCookie = generateExpiredPayloadCookie({
          collectionAuthConfig: req.payload.collections.users.config.auth,
          cookiePrefix: req.payload.config.cookiePrefix,
        })

        headers.set('Set-Cookie', expiredCookie)

        if (!req.user) {
          return Response.json(
            {
              message: req.t('authentication:logoutSuccessful'),
            },
            {
              headers,
              status: 200,
            },
          )
        }

        await logoutOperation({
          allSessions: req.searchParams.get('allSessions') === 'true',
          collection: req.payload.collections.users,
          req,
        })

        return Response.json(
          {
            message: req.t('authentication:logoutSuccessful'),
          },
          {
            headers,
            status: 200,
          },
        )
      },
    },
  ],
  access: {
    admin: adminOnlyBoolean,
    create: canCreateUser,
    delete: ({ req }) => {
      if (!(isAdmin(req.user) || hasPermission(req.user, PERMISSIONS.USERS_DELETE))) {
        return false
      }

      if (!req.user?.id) return true

      return {
        id: {
          not_equals: req.user.id,
        },
      }
    },
    read: ({ req }) => {
      if (isAdmin(req.user) || hasPermission(req.user, PERMISSIONS.USERS_READ)) return true
      return selfAccess({ req })
    },
    update: ({ req }) => {
      if (isAdmin(req.user) || hasPermission(req.user, PERMISSIONS.USERS_UPDATE)) return true
      return selfAccess({ req })
    },
  },
  admin: {
    hidden: ({ user }) =>
      !hasAnyPermission(user, [
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.USERS_DELETE,
      ]) && !isAdmin(user),
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'roles', 'updatedAt'],
  },
  auth: {
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token ?? ''
        return renderPasswordResetEmail({
          actionURL: `${env.publicServerUrl}/admin/reset/${token}`,
        })
      },
    },
    verify: {
      generateEmailHTML: ({ token }: { token?: string }) => {
        return renderVerifyEmail({
          actionURL: `${env.publicServerUrl}/verify/${token ?? ''}`,
        })
      },
    },
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ROLE_VALUES,
      defaultValue: [ROLES.EDITOR],
      required: true,
      saveToJWT: true,
      access: {
        create: ({ req }) => isAdmin(req.user),
        read: ({ req }) => isAdmin(req.user),
        update: ({ req }) => isAdmin(req.user),
      },
      admin: {
        condition: showPrivilegedUserFields,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: ['active', 'blocked', 'suspended', 'deactivated'],
      required: true,
      saveToJWT: true,
      access: {
        create: ({ req }) => isAdmin(req.user),
        read: ({ req }) => isAdmin(req.user),
        update: ({ req }) => isAdmin(req.user),
      },
      admin: {
        condition: showPrivilegedUserFields,
      },
    },
    {
      name: 'permissions',
      type: 'select',
      hasMany: true,
      options: Object.values(PERMISSIONS),
      defaultValue: [],
      saveToJWT: true,
      access: {
        create: ({ req }) => isAdmin(req.user),
        read: ({ req }) => isAdmin(req.user),
        update: ({ req }) => isAdmin(req.user),
      },
      admin: {
        condition: showPrivilegedUserFields,
      },
    },
    {
      name: 'deletionStrategy',
      type: 'select',
      defaultValue: 'deactivate',
      options: ['deactivate', 'reassign', 'delete-owned-content'],
      admin: {
        condition: showPrivilegedUserFields,
        description: 'Starter-safe default is deactivate. Hard deletes are opt-in per user.',
        position: 'sidebar',
      },
      access: {
        create: ({ req }) => isAdmin(req.user),
        read: ({ req }) => isAdmin(req.user),
        update: ({ req }) => isAdmin(req.user),
      },
    },
    {
      name: 'reassignOwnedContentTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: (data, siblingData, context) =>
          showPrivilegedUserFields(data, siblingData, context) && data?.deletionStrategy === 'reassign',
        position: 'sidebar',
      },
      access: {
        create: ({ req }) => isAdmin(req.user),
        read: ({ req }) => isAdmin(req.user),
        update: ({ req }) => isAdmin(req.user),
      },
    },
  ],
  hooks: {
    beforeLogin: [enforceActiveUserLogin],
    beforeChange: [beforeChange],
    beforeDelete: [beforeDelete],
  },
}
