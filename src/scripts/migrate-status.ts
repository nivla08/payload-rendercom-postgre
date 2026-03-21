import { getMigrationStatus } from '@/lib/migrations/status'

const main = async (): Promise<void> => {
  const status = await getMigrationStatus()

  console.log(JSON.stringify(status, null, 2))
}

main().catch((error) => {
  console.error('[migrate:status] failed', error)
  process.exit(1)
})
