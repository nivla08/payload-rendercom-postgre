'use client'

import { useMemo, useState } from 'react'
import { useFormContext, type FieldValues, type RegisterOptions } from 'react-hook-form'

import styles from '../form.module.css'
import type { BaseFieldProps } from '../types'

type PasswordInputProps<TFieldValues extends FieldValues = FieldValues> = BaseFieldProps<TFieldValues> & {
  confirm?: string
  placeholder?: string
}

/**
 * Password input with optional confirm-field matching.
 *
 * Example:
 * `<PasswordInput name="passwordConfirm" confirm="password" />`
 */
export function PasswordInput<TFieldValues extends FieldValues = FieldValues>({
  confirm,
  label = '',
  name,
  placeholder = '',
  rules,
}: PasswordInputProps<TFieldValues>) {
  const [passwordShown, setPasswordShown] = useState(false)
  const context = useFormContext<TFieldValues>()
  const {
    formState: { errors },
    getValues,
    register,
  } = context

  const fieldError = errors[name]

  const mergedRules = useMemo<RegisterOptions<TFieldValues>>(() => {
    const baseRules = rules ?? {}

    if (!confirm) {
      return baseRules
    }

    return {
      ...baseRules,
      validate: (value: unknown) => {
        const target = getValues(confirm as never)
        return value === target || 'Passwords do not match'
      },
    }
  }, [confirm, getValues, rules])

  return (
    <div className={`${styles.formElement} ${fieldError ? styles.hasError : ''}`}>
      <label className={styles.label} htmlFor={name}>
        {label}
        {mergedRules.required ? <span className={styles.requiredMark}>*</span> : null}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={name}
          placeholder={placeholder}
          className={styles.input}
          type={passwordShown ? 'text' : 'password'}
          autoComplete="new-password"
          {...register(name as never, mergedRules)}
        />
        <div className={styles.passwordToggle}>
          <button
            type="button"
            aria-label={passwordShown ? 'Hide password' : 'Show password'}
            onClick={() => setPasswordShown((previous) => !previous)}
          >
            {passwordShown ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      {fieldError && 'message' in fieldError && fieldError.message ? (
        <p className={styles.error}>{String(fieldError.message)}</p>
      ) : null}
    </div>
  )
}
