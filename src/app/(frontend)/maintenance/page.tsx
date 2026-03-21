import type { Metadata } from 'next'

import { buildPageMetadata } from '@/lib/metadata'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return buildPageMetadata({
    defaults: settings.meta,
    description: settings.maintenance.message,
    fallbackDescription: settings.maintenance.message,
    fallbackTitle: settings.siteDetails.siteName || 'Maintenance',
    noindex: true,
    title: settings.siteDetails.siteName || 'Maintenance',
    type: 'website',
  })
}

export default async function MaintenancePage() {
  const settings = await getSiteSettings()

  return (
    <main className="home">
      <div className="content">
        <h1>{settings.siteDetails.siteName || 'Maintenance'}</h1>
        <p>{settings.maintenance.message}</p>
      </div>
    </main>
  )
}
