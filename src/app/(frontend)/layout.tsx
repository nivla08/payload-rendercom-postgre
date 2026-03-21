import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

import { buildPageMetadata } from '@/lib/metadata'
import { getSiteSettings, matchesMaintenancePath } from '@/lib/site-settings'

import './styles.css'

const MAINTENANCE_BYPASS_COOKIE = 'payload-maintenance-bypass'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return buildPageMetadata({
    defaults: settings.meta,
    description: settings.meta.description || settings.siteDetails.slogan || 'Reusable Payload CMS starter.',
    fallbackDescription: 'Reusable Payload CMS starter.',
    fallbackTitle: settings.siteDetails.siteName || 'Payload Starter',
    image: settings.meta.image,
    title: settings.meta.title || settings.siteDetails.siteName || 'Payload Starter',
    type: 'website',
  })
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const settings = await getSiteSettings()
  const pathname = (await headers()).get('x-pathname') ?? '/'
  const bypassCookie = (await cookies()).get(MAINTENANCE_BYPASS_COOKIE)?.value

  const isAllowlisted =
    pathname === '/maintenance' ||
    settings.maintenance.allowlistedPaths.some((path) => matchesMaintenancePath(pathname, path))

  const hasBypass =
    settings.maintenance.bypassSecretEnabled &&
    settings.maintenance.bypassSecret &&
    bypassCookie === settings.maintenance.bypassSecret

  if (settings.maintenance.enabled && !isAllowlisted && !hasBypass) {
    redirect('/maintenance')
  }

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
