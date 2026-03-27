'use client'

import { Button, LoadingOverlay, toast, useAuth, useConfig, useRouteTransition, useTranslation } from '@payloadcms/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'
import React, { useEffect, useRef, useState } from 'react'

const baseClass = 'logout'

export const LogoutView = () => {
  const startedRef = useRef(false)
  const [failed, setFailed] = useState(false)
  const { setUser } = useAuth()
  const { config } = useConfig()
  const { startRouteTransition } = useRouteTransition()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const adminRoute = config.routes.admin
  const apiRoute = config.routes.api
  const loginRoute = config.admin.routes.login
  const userSlug = config.admin.user
  const redirect = searchParams.get('redirect')

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const run = async () => {
      setFailed(false)

      try {
        setUser(null)

        await fetch(
          formatAdminURL({
            apiRoute,
            path: `/${userSlug}/logout`,
          }),
          {
            credentials: 'include',
            method: 'POST',
          },
        )

        const nextLoginRoute = formatAdminURL({
          adminRoute,
          path: `${loginRoute}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`,
        })

        toast.success(t('authentication:loggedOutSuccessfully'))
        startRouteTransition(() => router.replace(nextLoginRoute))
      } catch (error) {
        console.error('Admin logout failed', error)
        setFailed(true)
      }
    }

    void run()
  }, [adminRoute, apiRoute, loginRoute, redirect, router, setUser, startRouteTransition, t, userSlug])

  if (failed) {
    return (
      <div className={`${baseClass}__wrap`}>
        <h2>{t('error:logoutFailed')}</h2>
        <Button
          buttonStyle="secondary"
          onClick={() => {
            startedRef.current = false
            setFailed(false)
          }}
          size="large"
        >
          {t('general:retry')}
        </Button>
        <Button
          buttonStyle="primary"
          el="link"
          size="large"
          url={formatAdminURL({
            adminRoute,
            path: loginRoute,
          })}
        >
          {t('authentication:backToLogin')}
        </Button>
      </div>
    )
  }

  return <LoadingOverlay animationDuration="0ms" loadingText={t('authentication:loggingOut')} />
}
