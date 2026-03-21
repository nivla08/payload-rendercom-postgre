import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

const normalizePath = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = normalizePath(url.searchParams.get('path') || '/')

  ;(await draftMode()).disable()
  redirect(path)
}
