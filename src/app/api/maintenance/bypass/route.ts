import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getSiteSettings } from '@/lib/site-settings'

const MAINTENANCE_BYPASS_COOKIE = 'payload-maintenance-bypass'

export const dynamic = 'force-dynamic'

const sanitizeRedirectPath = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return '/'

  // Keep redirects same-origin only. Absolute URLs or protocol-relative values
  // would turn this trusted bypass endpoint into an open redirect.
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/'
  }

  return trimmed
}

export const GET = async (request: Request): Promise<Response> => {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')?.trim() ?? ''
  const redirectTo = sanitizeRedirectPath(url.searchParams.get('redirect')?.trim() || '/')
  const settings = await getSiteSettings()

  if (
    !settings.maintenance.enabled ||
    !settings.maintenance.bypassSecretEnabled ||
    !settings.maintenance.bypassSecret ||
    secret !== settings.maintenance.bypassSecret
  ) {
    return NextResponse.json({ ok: false, error: 'Invalid maintenance bypass secret.' }, { status: 403 })
  }

  const response = NextResponse.redirect(new URL(redirectTo, url.origin))
  ;(await cookies()).set(MAINTENANCE_BYPASS_COOKIE, settings.maintenance.bypassSecret, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: '/',
    sameSite: 'lax',
    secure: url.protocol === 'https:',
  })

  return response
}
