import { env } from '@/config/env'

const DEFAULT_ALLOWED_EMBED_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'player.vimeo.com',
  'vimeo.com',
  'www.vimeo.com',
]

const normalizeHost = (value: string): string => value.trim().toLowerCase()

const allowedHosts = new Set(
  (env.embedAllowedHosts.length > 0 ? env.embedAllowedHosts : DEFAULT_ALLOWED_EMBED_HOSTS).map(normalizeHost),
)

export const validateEmbedURL = (value: string): string | true => {
  const raw = value.trim()
  if (!raw) return 'Embed URL is required.'

  let url: URL

  try {
    url = new URL(raw)
  } catch {
    return 'Enter a valid embed URL.'
  }

  if (url.protocol !== 'https:') {
    return 'Only HTTPS embeds are allowed.'
  }

  const host = normalizeHost(url.hostname)
  if (!allowedHosts.has(host)) {
    return `Embeds from ${host} are not allowed by this starter.`
  }

  return true
}
