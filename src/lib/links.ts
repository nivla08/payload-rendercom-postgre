type LinkType = 'custom' | 'internal'

type LinkReferenceDoc = {
  slug?: null | string
}

type PolymorphicReference = {
  relationTo?: string
  value?: LinkReferenceDoc | null | number | string
}

export type StructuredLinkValue = {
  appearance?: null | string
  newTab?: boolean | null
  reference?: LinkReferenceDoc | null | number | PolymorphicReference | string
  type?: LinkType | null
  url?: null | string
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const getReferenceSlug = (reference: StructuredLinkValue['reference']): null | string => {
  if (!reference) return null

  if (isRecord(reference) && 'slug' in reference && typeof reference.slug === 'string') {
    return reference.slug.trim() || null
  }

  if (isRecord(reference) && 'value' in reference) {
    const nested = reference.value
    if (isRecord(nested) && typeof nested.slug === 'string') {
      return nested.slug.trim() || null
    }
  }

  return null
}

export const resolveStructuredLinkHref = (link: StructuredLinkValue | null | undefined): null | string => {
  if (!link) return null

  if (link.type === 'custom') {
    const url = typeof link.url === 'string' ? link.url.trim() : ''
    return url || null
  }

  if (link.type === 'internal') {
    const slug = getReferenceSlug(link.reference)
    if (!slug) return null
    return slug.startsWith('/') ? slug : `/${slug}`
  }

  return null
}
