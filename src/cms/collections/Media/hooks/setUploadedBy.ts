import type { FieldHook } from 'payload'

/**
 * Stamp uploads with the current user when `uploadedBy` is not explicitly set.
 */
export const setUploadedBy: FieldHook = ({ req, value }) => value ?? req.user?.id
