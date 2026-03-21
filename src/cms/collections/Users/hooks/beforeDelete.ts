import { APIError, type CollectionBeforeDeleteHook, type PayloadRequest } from 'payload'

import { ROLES } from '@/cms/auth'
import { isSuperAdmin } from '@/cms/utilities/users'

type UserDeletionDoc = {
  deletionStrategy?: 'deactivate' | 'delete-owned-content' | 'reassign' | null
  reassignOwnedContentTo?: { id?: number | null } | number | null
}

type UserDeletionPayload = Pick<PayloadRequest['payload'], 'delete' | 'findByID' | 'update'>

const countSuperAdmins = async (req: PayloadRequest): Promise<number> => {
  const result = await req.payload.find({
    collection: 'users',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      roles: {
        contains: ROLES.SUPER_ADMIN,
      },
    },
  })

  return result.docs.length
}

const readComparableID = (value: unknown): null | number | string => {
  if (typeof value === 'string' || typeof value === 'number') return value
  return null
}

const readRelationNumberID = (value: UserDeletionDoc['reassignOwnedContentTo']): null | number => {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && typeof value.id === 'number') return value.id
  return null
}

const applyUserDeletionStrategy = async (args: {
  req: PayloadRequest
  userId: number | string
}): Promise<void> => {
  const { req, userId } = args
  const payload = req.payload as UserDeletionPayload
  const userDoc = (await payload.findByID({
    collection: 'users',
    id: userId,
    depth: 0,
    overrideAccess: true,
    req,
  })) as UserDeletionDoc

  const strategy = userDoc.deletionStrategy || 'deactivate'

  if (strategy === 'deactivate') {
    throw new APIError(
      'This user is configured for safe deactivation. Change status to deactivated instead of deleting.',
      400,
    )
  }

  if (strategy === 'reassign') {
    const reassignmentTarget = readRelationNumberID(userDoc.reassignOwnedContentTo)

    if (!reassignmentTarget) {
      throw new APIError('Select a reassignment target before deleting this user.', 400)
    }

    await Promise.all([
      payload.update({
        collection: 'pages',
        where: {
          author: {
            equals: userId,
          },
        },
        data: {
          author: reassignmentTarget,
        },
        overrideAccess: true,
        req,
      }),
      payload.update({
        collection: 'posts',
        where: {
          author: {
            equals: userId,
          },
        },
        data: {
          author: reassignmentTarget,
        },
        overrideAccess: true,
        req,
      }),
    ])
  }

  if (strategy === 'delete-owned-content') {
    await Promise.all([
      payload.delete({
        collection: 'pages',
        where: {
          author: {
            equals: userId,
          },
        },
        overrideAccess: true,
        req,
      }),
      payload.delete({
        collection: 'posts',
        where: {
          author: {
            equals: userId,
          },
        },
        overrideAccess: true,
        req,
      }),
    ])
  }
}

/**
 * Prevent destructive user deletion mistakes and enforce the configured safe
 * deletion strategy.
 */
export const beforeDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const userId = readComparableID(id)
  const currentId = readComparableID(req.user?.id)

  if (userId == null) return

  if (currentId != null && userId === currentId) {
    throw new APIError('Users cannot delete their own account.', 403)
  }

  const payload = req.payload as UserDeletionPayload
  const userDoc = await payload.findByID({
    collection: 'users',
    id: userId,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (isSuperAdmin(userDoc)) {
    const totalSuperAdmins = await countSuperAdmins(req)
    if (totalSuperAdmins <= 1) {
      throw new APIError('The last super-admin cannot be deleted.', 400)
    }
  }

  await applyUserDeletionStrategy({
    req,
    userId,
  })
}
