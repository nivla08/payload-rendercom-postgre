import config from '@payload-config'
import { getPayload } from 'payload'

import { ROLES } from '@/cms/auth'
import { env } from '@/config/env'

type SeedPayload = Awaited<ReturnType<typeof getPayload>>

const main = async (): Promise<void> => {
  if (!env.enableSeed) {
    console.log('[seed] PAYLOAD_ENABLE_SEED is false. Nothing to do.')
    return
  }

  const payload = (await getPayload({ config })) as SeedPayload

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteDetails: {
        siteName: 'Payload Starter',
        siteUrl: env.publicServerUrl,
      },
    },
    depth: 0,
    overrideAccess: true,
  })

  if (process.env.SEED_SUPER_ADMIN_EMAIL && process.env.SEED_SUPER_ADMIN_PASSWORD) {
    const existing = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        email: {
          equals: process.env.SEED_SUPER_ADMIN_EMAIL,
        },
      },
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: process.env.SEED_SUPER_ADMIN_EMAIL,
          password: process.env.SEED_SUPER_ADMIN_PASSWORD,
          roles: [ROLES.SUPER_ADMIN],
          status: 'active',
        },
        depth: 0,
        overrideAccess: true,
      })
    }
  }

  console.log('[seed] starter defaults applied')
}

main().catch((error) => {
  console.error('[seed] failed', error)
  process.exit(1)
})
