import type { FieldValues, RegisterOptions, UseFormReturn } from 'react-hook-form'

export type BaseFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  label?: string
  methods?: UseFormReturn<TFieldValues>
  name: string
  rules?: RegisterOptions<TFieldValues>
}
