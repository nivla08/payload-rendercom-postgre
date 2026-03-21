import type { Payload, SendEmailOptions } from 'payload'

export const sendEmailSafely = async (payload: Payload, message: SendEmailOptions): Promise<void> => {
  try {
    await payload.sendEmail(message)
  } catch (error) {
    payload.logger.error?.(
      `[email] sendEmailSafely failed ${JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        subject: message.subject,
        to: message.to,
      })}`,
    )
  }
}
