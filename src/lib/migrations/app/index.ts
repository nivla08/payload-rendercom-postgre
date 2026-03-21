import type { Payload } from 'payload'

export type AppMigration = {
  description: string
  id: string
  up: (payload: Payload) => Promise<void>
}

export const appMigrations: AppMigration[] = []
