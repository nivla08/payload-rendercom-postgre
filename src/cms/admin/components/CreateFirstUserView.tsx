'use client'

import React, { useMemo, useState } from 'react'

type ClientConfigShape = {
  admin: {
    routes?: {
      admin?: string
    }
    user: string
  }
  routes?: {
    api?: string
  }
}

type Props = {
  clientConfig: ClientConfigShape
}

/**
 * Starter-specific bootstrap screen for `/admin/create-first-user`.
 *
 * Payload's default create-first-user view can expose additional collection fields
 * because it loads the full client config before an authenticated admin exists.
 * We keep the first-run experience intentionally narrow here: just the credentials
 * needed to create the bootstrap super-admin. The backend still applies the safe
 * defaults in the Users collection hooks.
 */
export const CreateFirstUserView = ({ clientConfig }: Props) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const apiURL = useMemo(() => {
    const apiBase = clientConfig.routes?.api ?? '/api'
    return `${apiBase}/${clientConfig.admin.user}/first-register`
  }, [clientConfig])

  const adminURL = clientConfig.admin.routes?.admin ?? '/admin'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      setError('Email is required.')
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(apiURL, {
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { errors?: Array<{ message?: string }>; message?: string }
          | null

        const message = payload?.errors?.[0]?.message ?? payload?.message ?? 'Unable to create the first user.'
        setError(message)
        return
      }

      window.location.assign(adminURL)
    } catch {
      setError('Unable to reach the registration endpoint. Check the server logs and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      style={{
        alignItems: 'center',
        background:
          'radial-gradient(circle at top left, rgba(191, 96, 55, 0.10), transparent 34%), radial-gradient(circle at bottom right, rgba(72, 115, 91, 0.10), transparent 30%), var(--theme-bg, #f5f1ea)',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 251, 245, 0.94)',
          border: '1px solid rgba(61, 45, 28, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 26px 70px rgba(48, 31, 16, 0.12)',
          maxWidth: '520px',
          padding: '2rem',
          width: '100%',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              color: '#93421f',
              fontSize: '.76rem',
              fontWeight: 700,
              letterSpacing: '.12em',
              marginBottom: '.85rem',
              textTransform: 'uppercase',
            }}
          >
            Starter Bootstrap
          </div>
          <h1 style={{ fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0 }}>Create First User</h1>
          <p style={{ color: 'var(--theme-elevation-600, #4b5563)', lineHeight: 1.6, marginBottom: 0 }}>
            This creates the bootstrap super-admin for the project. Roles, status, and other lifecycle fields are
            assigned automatically after account creation.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '.375rem' }}>
            <span style={{ fontSize: '.92rem', fontWeight: 600 }}>Email</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{
                border: '1px solid rgba(61, 45, 28, 0.16)',
                borderRadius: '14px',
                minHeight: '48px',
                padding: '.8rem .9rem',
              }}
              type="email"
              value={email}
            />
          </label>

          <label style={{ display: 'grid', gap: '.375rem' }}>
            <span style={{ fontSize: '.92rem', fontWeight: 600 }}>Password</span>
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{
                border: '1px solid rgba(61, 45, 28, 0.16)',
                borderRadius: '14px',
                minHeight: '48px',
                padding: '.8rem .9rem',
              }}
              type="password"
              value={password}
            />
          </label>

          <label style={{ display: 'grid', gap: '.375rem' }}>
            <span style={{ fontSize: '.92rem', fontWeight: 600 }}>Confirm Password</span>
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              style={{
                border: '1px solid rgba(61, 45, 28, 0.16)',
                borderRadius: '14px',
                minHeight: '48px',
                padding: '.8rem .9rem',
              }}
              type="password"
              value={confirmPassword}
            />
          </label>

          {error ? (
            <p
              style={{
                color: '#b91c1c',
                margin: 0,
              }}
            >
              {error}
            </p>
          ) : null}

          <button
            disabled={submitting}
            style={{
              background: '#b6542f',
              border: '1px solid #b6542f',
              borderRadius: '999px',
              color: '#fff8f2',
              cursor: submitting ? 'progress' : 'pointer',
              fontSize: '.95rem',
              fontWeight: 700,
              minHeight: '50px',
              padding: '.85rem 1rem',
            }}
            type="submit"
          >
            {submitting ? 'Creating...' : 'Create Super Admin'}
          </button>
        </form>
      </div>
    </main>
  )
}
