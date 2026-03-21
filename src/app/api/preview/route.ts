import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { env } from '@/config/env'

const normalizePath = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  const path = normalizePath(url.searchParams.get('path') || '/')

  if (secret !== env.previewSecret) {
    return Response.json({ error: 'Invalid preview secret.' }, { status: 401 })
  }

  ;(await draftMode()).enable()
  redirect(path)
}
