'use client'

import { useState } from 'react'

import { PasswordInput, SmartForm, TextInput } from '@/components/forms'

type RegisterFormValues = {
  confirmPassword: string
  email: string
  honeypot: string
  password: string
}

type RegisterResponse = {
  error?: string
  message?: string
  ok?: boolean
  redirectTo?: string
}

type RegisterFormProps = {
  honeypotEnabled: boolean
}

export function RegisterForm({ honeypotEnabled }: RegisterFormProps) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  return (
    <SmartForm<RegisterFormValues>
      defaultValues={{
        confirmPassword: '',
        email: '',
        honeypot: '',
        password: '',
      }}
      loading={loading}
      loadingLabel="Creating account..."
      onSubmit={async (values) => {
        setLoading(true)
        setErrorMessage(null)
        setSuccessMessage(null)

        try {
          const response = await fetch('/api/register', {
            body: JSON.stringify({
              email: values.email.trim(),
              honeypot: values.honeypot,
              password: values.password,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const data = (await response.json().catch(() => ({}))) as RegisterResponse

          if (!response.ok || !data.ok) {
            throw new Error(data.error || 'Unable to create your account. Please try again.')
          }

          setSuccessMessage(data.message || 'Account created successfully.')

          if (data.redirectTo) {
            window.setTimeout(() => {
              window.location.assign(data.redirectTo as string)
            }, 1200)
          }
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Unexpected error while registering.')
        } finally {
          setLoading(false)
        }
      }}
      submitLabel="Create account"
    >
      <>
        <TextInput<RegisterFormValues>
          autocomplete="email"
          inputType="email"
          label="Email"
          name="email"
          placeholder="name@example.com"
          rules={{
            pattern: {
              message: 'Please provide a valid email address.',
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            },
            required: 'Email is required.',
          }}
        />

        <PasswordInput<RegisterFormValues>
          label="Password"
          name="password"
          placeholder="Create a password"
          rules={{
            minLength: {
              message: 'Password must be at least 8 characters.',
              value: 8,
            },
            required: 'Password is required.',
          }}
        />

        <PasswordInput<RegisterFormValues>
          confirm="password"
          label="Confirm password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          rules={{ required: 'Please confirm your password.' }}
        />

        {honeypotEnabled ? (
          <TextInput<RegisterFormValues> autocomplete="off" inputType="hidden" label="Honeypot" name="honeypot" />
        ) : null}

        {successMessage ? <p className="register-form__success">{successMessage}</p> : null}
        {errorMessage ? <p className="register-form__error">{errorMessage}</p> : null}
      </>
    </SmartForm>
  )
}
