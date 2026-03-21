import { s3Storage } from '@payloadcms/storage-s3'
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

  return [
    s3Storage({
      acl: env.storage.s3.acl === 'private' ? 'private' : 'public-read',
      bucket: env.storage.s3.bucket as string,
      collections: {
        media: env.storage.s3.prefix
          ? {
              prefix: env.storage.s3.prefix,
            }
          : true,
      },
      config: {
        credentials:
          env.storage.s3.accessKeyId && env.storage.s3.secretAccessKey
            ? {
                accessKeyId: env.storage.s3.accessKeyId,
                secretAccessKey: env.storage.s3.secretAccessKey,
              }
            : undefined,
        endpoint: env.storage.s3.endpoint,
        forcePathStyle: env.storage.s3.forcePathStyle,
        region: env.storage.s3.region,
      },
      disableLocalStorage: true,
    }),
  ]
}
