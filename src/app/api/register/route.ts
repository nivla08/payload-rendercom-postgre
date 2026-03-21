import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getRegistrationSettings } from '@/lib/site-settings'

const PASSWORD_MIN_LENGTH = 8

type ParsedRegistrationPayload = {
  email: string
  honeypot: string
  password: string
}

class ValidationError extends Error {}

const sanitizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const parseRequestBody = async (request: Request): Promise<ParsedRegistrationPayload> => {
  const contentType = request.headers.get('content-type') || ''
  const isMultipart = contentType.toLowerCase().includes('multipart/form-data')

  if (isMultipart) {
    const formData = await request.formData()

    return {
      email: sanitizeText(formData.get('email')),
      honeypot: sanitizeText(formData.get('honeypot') ?? formData.get('company')),
      password: sanitizeText(formData.get('password')),
    }
  }

  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    throw new ValidationError('Invalid request payload.')
  }

  return {
    email: sanitizeText(body.email),
    honeypot: sanitizeText(body.honeypot ?? body.company),
    password: sanitizeText(body.password),
  }
}

const validatePayload = (payload: ParsedRegistrationPayload): string | null => {
  if (!payload.email) return 'Email is required.'
  if (!isValidEmail(payload.email)) return 'Please provide a valid email address.'
  if (!payload.password) return 'Password is required.'
  if (payload.password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
  }
  return null
}

const isDuplicateEmailError = (error: unknown): boolean => {
  const asText = String(error).toLowerCase()
  return (
    asText.includes('duplicate') ||
    asText.includes('already exists') ||
    asText.includes('unique') ||
    asText.includes('email')
  )
}

export const runtime = 'nodejs'

export const POST = async (request: Request): Promise<Response> => {
  try {
    const registration = await getRegistrationSettings()

    if (!registration.allowRegistration) {
      return Response.json({ ok: false, error: 'Not found' }, { status: 404 })
    }

    const parsed = await parseRequestBody(request)

    if (registration.registrationHoneypotEnabled && parsed.honeypot) {
      return Response.json(
        {
          ok: true,
          message: registration.registrationSuccessMessage,
          redirectTo: registration.registrationRedirectURL,
          requiresApproval: registration.registrationRequiresApproval,
        },
        { status: 200 },
      )
    }

    const validationError = validatePayload(parsed)
    if (validationError) {
      return Response.json({ ok: false, error: validationError }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    try {
      await payload.create({
        collection: 'users',
        data: {
          email: parsed.email,
          password: parsed.password,
        },
      })
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        return Response.json(
          {
            ok: true,
            message: registration.registrationSuccessMessage,
            redirectTo: registration.registrationRedirectURL,
            requiresApproval: registration.registrationRequiresApproval,
          },
          { status: 200 },
        )
      }

      throw error
    }

    return Response.json(
      {
        ok: true,
        message: registration.registrationSuccessMessage,
        redirectTo: registration.registrationRedirectURL,
        requiresApproval: registration.registrationRequiresApproval,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json({ ok: false, error: error.message }, { status: 400 })
    }

    console.error('Registration failed', error)
    return Response.json(
      { ok: false, error: 'Unable to create your account right now. Please try again later.' },
      { status: 500 },
    )
  }
}
