import 'dotenv/config'

type EnvSource = NodeJS.ProcessEnv

export type StarterEnv = {
  allowedOrigins: string[]
  databaseUrl: string
  enableDbMigrations: boolean
  enableSeed: boolean
  email: {
    from: string
    provider: 'console' | 'smtp'
    replyTo?: string
    smtp: {
      enabled: boolean
      host?: string
      password?: string
      port: number
      secure: boolean
      user?: string
    }
  }
  mediaDir: string
  payloadSecret: string
  publicServerUrl: string
  storageProvider: 'local' | 's3'
}

const truthy = new Set(['1', 'true', 'yes', 'on'])

const readString = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const readBoolean = (value: string | undefined, fallback = false): boolean => {
  const normalized = readString(value)?.toLowerCase()
  if (!normalized) return fallback
  return truthy.has(normalized)
}

const readNumber = (value: string | undefined, fallback: number): number => {
  const normalized = readString(value)
  if (!normalized) return fallback
  const parsed = Number.parseInt(normalized, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const readRequired = (name: string, source: EnvSource): string => {
  const value = readString(source[name])
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`)
  }
  return value
}

const readAllowedOrigins = (source: EnvSource, fallbackOrigin: string): string[] => {
  const raw = readString(source.PAYLOAD_CORS_ORIGIN)
  if (!raw) return [fallbackOrigin]

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

const readEmailProvider = (source: EnvSource): 'console' | 'smtp' => {
  const explicitProvider = readString(source.PAYLOAD_EMAIL_PROVIDER)?.toLowerCase()
  if (explicitProvider === 'smtp') return 'smtp'
  if (explicitProvider === 'console') return 'console'

  // Backward compatibility for earlier starter versions.
  return readBoolean(source.PAYLOAD_SMTP_ENABLED, false) ? 'smtp' : 'console'
}

const buildEnv = (source: EnvSource): StarterEnv => {
  const nodeEnv = readString(source.NODE_ENV) ?? 'development'
  const isHostedProduction = nodeEnv === 'production' && readBoolean(source.RENDER, false)
  const publicServerUrl = readString(source.PAYLOAD_PUBLIC_SERVER_URL) ?? (
    isHostedProduction ? undefined : 'http://localhost:3000'
  )
  const payloadSecret = readString(source.PAYLOAD_SECRET) ?? (
    isHostedProduction ? undefined : 'local-dev-payload-secret'
  )

  if (!publicServerUrl) {
    throw new Error('[env] Missing required environment variable: PAYLOAD_PUBLIC_SERVER_URL')
  }

  if (!payloadSecret) {
    throw new Error('[env] Missing required environment variable: PAYLOAD_SECRET')
  }

  const emailProvider = readEmailProvider(source)

  return {
    allowedOrigins: readAllowedOrigins(source, publicServerUrl),
    databaseUrl: readRequired('DATABASE_URL', source),
    enableDbMigrations: readBoolean(source.PAYLOAD_ENABLE_DB_MIGRATIONS, true),
    enableSeed: readBoolean(source.PAYLOAD_ENABLE_SEED, false),
    email: {
      from: readString(source.PAYLOAD_EMAIL_FROM) ?? 'Payload Starter <no-reply@example.com>',
      provider: emailProvider,
      replyTo: readString(source.PAYLOAD_EMAIL_REPLY_TO),
      smtp: {
        enabled: emailProvider === 'smtp',
        host: readString(source.PAYLOAD_SMTP_HOST),
        password: readString(source.PAYLOAD_SMTP_PASSWORD),
        port: readNumber(source.PAYLOAD_SMTP_PORT, 587),
        secure: readBoolean(source.PAYLOAD_SMTP_SECURE, false),
        user: readString(source.PAYLOAD_SMTP_USER),
      },
    },
    mediaDir: readString(source.PAYLOAD_MEDIA_DIR) ?? 'media',
    payloadSecret,
    publicServerUrl,
    storageProvider: readString(source.PAYLOAD_STORAGE_PROVIDER) === 's3' ? 's3' : 'local',
  }
}

export const env = buildEnv(process.env)
