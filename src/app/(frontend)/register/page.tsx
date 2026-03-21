import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RegisterForm } from './RegisterForm'
import { buildPageMetadata } from '@/lib/metadata'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return buildPageMetadata({
    defaults: settings.meta,
    description: 'Create a user account.',
    fallbackDescription: 'Create a user account.',
    fallbackTitle: 'Register',
    title: 'Register',
    type: 'website',
  })
}

export default async function RegisterPage() {
  const settings = await getSiteSettings()

  if (!settings.auth.allowRegistration) {
    notFound()
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <p className="content-kicker">Account Access</p>
        <h1>Register</h1>
        <p>Create your account using the form below.</p>
        <RegisterForm honeypotEnabled={settings.auth.registrationHoneypotEnabled} />

        <p style={{ marginTop: '0.75rem' }}>
          Already have an account? <Link href="/admin/login">Log in</Link>.
        </p>
      </div>
    </div>
  )
}
