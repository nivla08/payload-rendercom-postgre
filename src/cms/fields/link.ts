import type {
  CheckboxField,
  Field,
  GroupField,
  RadioField,
  RelationshipField,
  SelectField,
  TextField,
} from 'payload'

type LinkType = 'custom' | 'internal'

type LinkFieldOptions = {
  allowedTypes?: LinkType[]
  appearanceOptions?: string[]
  description?: string
  label?: string
  name: string
  relationTo?: string | string[]
  required?: boolean
  showAppearance?: boolean
  showNewTab?: boolean
}

type LinkSiblingData = {
  type?: LinkType
}

const LINK_TYPE_LABELS: Record<LinkType, string> = {
  custom: 'Custom URL',
  internal: 'Internal document',
}

const hasValue = (value: unknown): boolean => {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

const isValidUrl = (value: string): boolean => {
  if (!value) return false

  if (
    value.startsWith('/') ||
    value.startsWith('#') ||
    value.startsWith('?') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:')
  ) {
    return true
  }

  try {
    const url = new URL(value)
    return Boolean(url.protocol)
  } catch {
    return false
  }
}

const normalizeAllowedTypes = (allowedTypes?: LinkType[]): LinkType[] => {
  if (!allowedTypes || allowedTypes.length === 0) return ['custom', 'internal']

  const unique = Array.from(new Set(allowedTypes)).filter((type): type is LinkType => {
    return type === 'custom' || type === 'internal'
  })

  return unique.length > 0 ? unique : ['custom', 'internal']
}

/**
 * Reusable structured link field.
 *
 * Use this when content editors should be able to choose between an internal
 * reference and a custom URL without every collection/global reinventing the
 * same field group and validation rules.
 */
export const linkField = (options: LinkFieldOptions): Field => {
  const {
    allowedTypes,
    appearanceOptions = ['default'],
    description,
    label,
    name,
    relationTo = ['pages'],
    required = false,
    showAppearance = false,
    showNewTab = true,
  } = options

  const types = normalizeAllowedTypes(allowedTypes)
  const singleType = types.length === 1 ? types[0] : undefined

  const typeField: RadioField = {
    name: 'type',
    type: 'radio',
    required,
    defaultValue: singleType,
    options: types.map((type) => ({
      label: LINK_TYPE_LABELS[type],
      value: type,
    })),
    admin: {
      hidden: Boolean(singleType),
      layout: 'horizontal',
    },
  }

  const urlField: TextField = {
    name: 'url',
    type: 'text',
    validate: (value, { siblingData }) => {
      const sibling = siblingData as LinkSiblingData | undefined
      const linkType = singleType ?? sibling?.type

      if (linkType !== 'custom') return true
      if (!hasValue(value)) return 'URL is required when type is custom.'
      if (typeof value !== 'string' || !isValidUrl(value)) return 'Enter a valid URL.'

      return true
    },
    admin: {
      condition: (_, siblingData) => {
        const sibling = siblingData as LinkSiblingData | undefined
        return (singleType ?? sibling?.type) === 'custom'
      },
    },
  }

  const referenceField: RelationshipField = {
    name: 'reference',
    type: 'relationship',
    relationTo: relationTo as RelationshipField['relationTo'],
    hasMany: false,
    validate: (value, { siblingData }) => {
      const sibling = siblingData as LinkSiblingData | undefined
      const linkType = singleType ?? sibling?.type

      if (linkType !== 'internal') return true
      if (!hasValue(value)) return 'Reference is required when type is internal.'

      return true
    },
    admin: {
      condition: (_, siblingData) => {
        const sibling = siblingData as LinkSiblingData | undefined
        return (singleType ?? sibling?.type) === 'internal'
      },
    },
  }

  const fields: GroupField['fields'] = [typeField, urlField, referenceField]

  if (showNewTab) {
    fields.push({
      name: 'newTab',
      type: 'checkbox',
      defaultValue: false,
    } satisfies CheckboxField)
  }

  if (showAppearance) {
    fields.push({
      name: 'appearance',
      type: 'select',
      defaultValue: appearanceOptions[0] ?? 'default',
      options: appearanceOptions.length > 0 ? appearanceOptions : ['default'],
    } satisfies SelectField)
  }

  return {
    name,
    label,
    type: 'group',
    fields,
    admin: {
      description,
    },
  }
}
