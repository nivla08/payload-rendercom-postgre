import { runAppMigrations } from '@/lib/migrations/run'

const main = async (): Promise<void> => {
  const result = await runAppMigrations()

  if (result.executed.length === 0) {
    console.log('[migrate:app] no pending app migrations')
    return
  }

  console.log(`[migrate:app] executed: ${result.executed.join(', ')}`)
}

main().catch((error) => {
  console.error('[migrate:app] failed', error)
  process.exit(1)
})
