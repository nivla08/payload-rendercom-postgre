import fs from 'fs/promises'
import path from 'path'

import config from '@payload-config'
import { getPayload } from 'payload'

import { appMigrations } from './app'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type MigrationRunDoc = {
  migrationId?: null | string
}

export const getMigrationStatus = async (): Promise<{
  app: { completed: string[]; pending: string[] }
  db: { files: string[] }
}> => {
  const payload = (await getPayload({ config })) as PayloadClient
  const migrationDir = path.resolve(process.cwd(), 'src/migrations')
  const files = (await fs.readdir(migrationDir))
    .filter((entry) => /^\d.*\.ts$/.test(entry))
    .map((entry) => entry.replace(/\.ts$/, ''))
    .sort()

  const runs = await payload.find({
    collection: 'migration-runs',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
  })

  const completed = runs.docs
    .map((doc) => ('migrationId' in (doc as MigrationRunDoc) ? (doc as MigrationRunDoc).migrationId : null))
    .filter((value: unknown): value is string => Boolean(value))

  const appIds = appMigrations.map((migration) => migration.id)

  return {
    app: {
      completed,
      pending: appIds.filter((id) => !completed.includes(id)),
    },
    db: {
      files,
    },
  }
}
