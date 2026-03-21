import { env } from '@/config/env'

const main = async (): Promise<void> => {
  console.log(
    JSON.stringify(
      {
        databaseUrlConfigured: Boolean(env.databaseUrl),
        publicServerUrl: env.publicServerUrl,
        smtpEnabled: env.email.smtp.enabled,
        storageProvider: env.storageProvider,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error('[verify] failed', error)
  process.exit(1)
})
