'use client'

import { useFormContext, type FieldValues } from 'react-hook-form'

import styles from './form.module.css'
import type { BaseFieldProps } from './types'

type TextInputProps<TFieldValues extends FieldValues = FieldValues> = BaseFieldProps<TFieldValues> & {
  autocomplete?: 'on' | 'off' | 'email' | 'new-password'
  hasError?: boolean
  inputType?: 'text' | 'email' | 'number' | 'hidden' | 'tel' | 'url' | 'search'
  placeholder?: string
  readOnly?: boolean
}

/**
 * Starter text input for `react-hook-form` forms.
 *
 * Use for simple text, email, URL, search, or hidden inputs.
 */
export function TextInput<TFieldValues extends FieldValues = FieldValues>({
  autocomplete = 'off',
  hasError = false,
  inputType = 'text',
  label = '',
  name,
  placeholder = '',
  readOnly = false,
  rules,
}: TextInputProps<TFieldValues>) {
  const context = useFormContext<TFieldValues>()
  const errors = context.formState.errors
  const fieldError = errors?.[name]

  return (
    <div className={`${styles.formElement} ${fieldError || hasError ? styles.hasError : ''}`}>
      {inputType !== 'hidden' ? (
        <label className={styles.label} htmlFor={name}>
          {label}
          {rules?.required ? <span className={styles.requiredMark}>*</span> : null}
        </label>
      ) : null}
      <div className={styles.inputWrap}>
        <input
          id={name}
          readOnly={readOnly}
          placeholder={placeholder}
          className={styles.input}
          type={inputType}
          autoComplete={autocomplete}
          {...context.register(name as never, rules ?? {})}
        />
      </div>
      {fieldError && 'message' in fieldError && fieldError.message ? (
        <p className={styles.error}>{String(fieldError.message)}</p>
      ) : null}
    </div>
  )
}
