import type { PayloadEmailAdapter, SendEmailOptions } from 'payload'

import { env } from '@/config/env'
import { getEmailDefaults, hasSMTPConfiguration } from '@/cms/email/config'

type SMTPTransport = {
  sendMail: (options: Record<string, unknown>) => Promise<unknown>
}

const normalizeRecipients = (value: SendEmailOptions['to']): string[] => {
  if (!value) return []
  return Array.isArray(value) ? value.map(String) : [String(value)]
}

const loadSMTPTransport = async (): Promise<null | SMTPTransport> => {
  if (!hasSMTPConfiguration()) return null

  const nodemailerModule = await import('nodemailer').catch(() => null)
  if (!nodemailerModule?.default?.createTransport) {
    console.warn('[email] nodemailer is not installed. Falling back to console email logging.')
    return null
  }

  return nodemailerModule.default.createTransport({
    auth: {
      pass: env.email.smtp.password,
      user: env.email.smtp.user,
    },
    host: env.email.smtp.host,
    port: env.email.smtp.port,
    secure: env.email.smtp.secure,
  }) as SMTPTransport
}

export const createEmailAdapter = (): PayloadEmailAdapter => {
  return ({ payload }) => {
    const defaults = getEmailDefaults()
    let transportPromise: null | Promise<null | SMTPTransport> = null
    const provider = env.email.provider

    return {
      defaultFromAddress: defaults.from.address,
      defaultFromName: defaults.from.name ?? '',
      name: provider,
      sendEmail: async (message) => {
        const recipients = normalizeRecipients(message.to)

        if (provider !== 'smtp') {
          payload.logger.info?.(`[email] console email ${JSON.stringify({ subject: message.subject, to: recipients })}`)
          return
        }

        transportPromise ??= loadSMTPTransport()
        const transport = await transportPromise

        if (!transport) {
          payload.logger.warn?.(
            `[email] SMTP is enabled but not available. Email delivery skipped. ${JSON.stringify({ subject: message.subject, to: recipients })}`,
          )
          return
        }

        try {
          await transport.sendMail({
            ...message,
            from: message.from ?? defaults.from,
            replyTo: message.replyTo ?? defaults.replyTo,
          })
        } catch (error) {
          payload.logger.error?.(
            `[email] send failed ${JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
              subject: message.subject,
              to: recipients,
            })}`,
          )
        }
      },
    }
  }
}
