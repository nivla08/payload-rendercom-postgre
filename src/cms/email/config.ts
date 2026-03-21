import { env } from '@/config/env'

const parseMailbox = (value: string): { address: string; name?: string } => {
  const match = value.match(/^(.*)<(.+)>$/)
  if (!match) {
    return { address: value.trim() }
  }

  return {
    address: match[2].trim(),
    name: match[1].trim() || undefined,
  }
}

export const getEmailDefaults = () => {
  return {
    from: parseMailbox(env.email.from),
    replyTo: env.email.replyTo,
  }
}

export const hasSMTPConfiguration = (): boolean => {
  const smtp = env.email.smtp
  if (env.email.provider !== 'smtp' || !smtp.enabled) return false
  return Boolean(smtp.host && smtp.user && smtp.password)
}
