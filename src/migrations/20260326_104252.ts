import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  void db
  void payload
  void req
  void sql
  // No-op runtime migration.
  // This file intentionally advances the Payload schema snapshot baseline so
  // future `migrate:create` runs only include new schema deltas.
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  void db
  void payload
  void req
  void sql
}
