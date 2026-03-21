'use client'

import { Children, cloneElement, isValidElement, type ReactNode } from 'react'
import {
  FormProvider,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
  useForm,
} from 'react-hook-form'

import styles from './form.module.css'

type SmartFormRenderFn<TFieldValues extends FieldValues> = (methods: UseFormReturn<TFieldValues>) => ReactNode
type SmartFormChildren<TFieldValues extends FieldValues> = ReactNode | SmartFormRenderFn<TFieldValues>
type InjectableProps<TFieldValues extends FieldValues> = {
  children?: ReactNode
  methods?: UseFormReturn<TFieldValues>
  name?: string
}

type SmartFormProps<TFieldValues extends FieldValues = FieldValues> = {
  children: SmartFormChildren<TFieldValues>
  className?: string
  defaultValues?: DefaultValues<TFieldValues>
  hideSubmitButton?: boolean
  loading?: boolean
  loadingLabel?: string
  methods?: UseFormReturn<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  submitLabel?: string
}

const cloneWithMethods = <TFieldValues extends FieldValues>(
  children: ReactNode,
  methods: UseFormReturn<TFieldValues>,
): ReactNode => {
  return Children.map(children, (child) => {
    if (!isValidElement<InjectableProps<TFieldValues>>(child)) {
      return child
    }

    const hasName = typeof child.props.name === 'string' && child.props.name.length > 0
    const nextProps: Partial<InjectableProps<TFieldValues>> = hasName ? { methods } : {}

    if (child.props.children) {
      nextProps.children = cloneWithMethods(child.props.children, methods)
    }

    return cloneElement(child, nextProps)
  })
}

/**
 * Thin `react-hook-form` wrapper used for starter forms.
 *
 * It supports either:
 * - plain child components that consume form context, or
 * - a render function when a form needs direct access to methods.
 *
 * Example:
 * `<SmartForm onSubmit={...}><TextInput name="email" /></SmartForm>`
 */
export function SmartForm<TFieldValues extends FieldValues = FieldValues>({
  children,
  className,
  defaultValues,
  hideSubmitButton = false,
  loading = false,
  loadingLabel = 'Processing...',
  methods: externalMethods,
  onSubmit,
  submitLabel = 'Submit',
}: SmartFormProps<TFieldValues>) {
  const internalMethods = useForm<TFieldValues>({
    criteriaMode: 'all',
    defaultValues,
    mode: 'all',
  })

  const methods = externalMethods ?? internalMethods
  const {
    handleSubmit,
    formState: { isValid },
  } = methods

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children(methods)
    }

    return cloneWithMethods(children, methods)
  }

  return (
    <FormProvider {...methods}>
      <form className={className} onSubmit={handleSubmit(onSubmit)}>
        {renderChildren()}
        {!hideSubmitButton ? (
          <div className={styles.actions} data-form-actions="submit">
            <button type="submit" className="btn-primary" disabled={!isValid || loading}>
              {loading ? loadingLabel : submitLabel}
            </button>
          </div>
        ) : null}
      </form>
    </FormProvider>
  )
}
