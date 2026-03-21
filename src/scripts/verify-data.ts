import config from '@payload-config'
import { getPayload } from 'payload'

import { env } from '@/config/env'
import { getMigrationStatus } from '@/lib/migrations/status'

type VerifyPayload = Awaited<ReturnType<typeof getPayload>>

const main = async (): Promise<void> => {
  const payload = (await getPayload({ config })) as VerifyPayload
  const status = await getMigrationStatus()

  if (status.app.pending.length > 0) {
    throw new Error(`[verify:data] Pending app migrations: ${status.app.pending.join(', ')}`)
  }

  const settings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  })) as { siteDetails?: { siteUrl?: string } }

  const siteUrl = typeof settings.siteDetails?.siteUrl === 'string' ? settings.siteDetails.siteUrl.trim() : ''
  if (siteUrl && siteUrl !== env.publicServerUrl) {
    console.warn(
      `[verify:data] site-settings.siteDetails.siteUrl (${siteUrl}) does not match PAYLOAD_PUBLIC_SERVER_URL (${env.publicServerUrl})`,
    )
  }

  console.log(
    JSON.stringify(
      {
        appMigrationsPending: status.app.pending.length,
        dbMigrationFiles: status.db.files.length,
        siteSettingsConfigured: Boolean(siteUrl),
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
