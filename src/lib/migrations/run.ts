import config from '@payload-config'
import { getPayload } from 'payload'

import { appMigrations } from './app'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type MigrationRunDoc = {
  migrationId?: null | string
}

export const runAppMigrations = async (): Promise<{ executed: string[] }> => {
  const payload = (await getPayload({ config })) as PayloadClient

  const existing = await payload.find({
    collection: 'migration-runs',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
  })

  const completed = new Set(
    existing.docs
      .map((doc) => ('migrationId' in (doc as MigrationRunDoc) ? (doc as MigrationRunDoc).migrationId : null))
      .filter((value: unknown): value is string => Boolean(value)),
  )

  const executed: string[] = []

  for (const migration of appMigrations) {
    if (completed.has(migration.id)) continue

    await migration.up(payload)

    await payload.create({
      collection: 'migration-runs',
      data: {
        executedAt: new Date().toISOString(),
        migrationId: migration.id,
        notes: migration.description,
        status: 'completed',
      },
      depth: 0,
      overrideAccess: true,
    })

    executed.push(migration.id)
  }

  return { executed }
}
