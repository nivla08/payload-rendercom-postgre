import { APIError, type CollectionBeforeLoginHook } from 'payload'

/**
 * Prevent suspended or deactivated users from logging in.
 */
export const enforceActiveUserLogin: CollectionBeforeLoginHook = ({ user }) => {
  if (!user) return user

  if (user.status && user.status !== 'active') {
    throw new APIError('This account is not active.', 403)
  }

  return user
}
