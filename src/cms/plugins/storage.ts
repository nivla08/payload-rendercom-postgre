import type { Plugin } from 'payload'

import { env } from '@/config/env'

/**
 * Extension point for durable media storage.
 *
 * The starter defaults to local disk for development. Projects that need
 * production-safe uploads on Render should wire an S3-compatible Payload storage
 * plugin here and return it when `PAYLOAD_STORAGE_PROVIDER=s3`.
 */
export const createStoragePlugins = (): Plugin[] => {
  if (env.storageProvider !== 's3') return []

  console.warn(
    '[storage] PAYLOAD_STORAGE_PROVIDER is set to s3, but no storage plugin is installed yet. Add an S3-compatible Payload storage plugin before using this in production.',
  )

  return []
}
