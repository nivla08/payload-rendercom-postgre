import type { Config } from '@/payload-types'
import type { CollectionSlug as PayloadCollectionSlug, PaginatedDocs, Payload, SelectType, Where } from 'payload'

type Collections = Config['collections']

type KnownCollectionSlug = Extract<keyof Collections, PayloadCollectionSlug>
export type ViewCollectionSlug = PayloadCollectionSlug
export type ViewSelectInput = SelectType | string[] | undefined

type CollectionDoc<TSlug extends ViewCollectionSlug> = TSlug extends KnownCollectionSlug
  ? Collections[TSlug]
  : Record<string, unknown>

export type CreateViewArgs<TSlug extends ViewCollectionSlug> = {
  collection: TSlug
  depth?: number
  limit?: number
  page?: number
  pagination?: boolean
  select?: ViewSelectInput
  sort?: string
  trash?: boolean
  where?: Where
}

type GenericFindArgs = {
  collection: ViewCollectionSlug
  select?: SelectType
  trash?: boolean
  [key: string]: unknown
}

/**
 * Convert a string-path select list into Payload's nested `select` object.
 *
 * Example:
 * `['title', 'meta.description']`
 * becomes
 * `{ title: true, meta: { description: true } }`
 */
const toSelectObject = (select?: SelectType | string[]): SelectType | undefined => {
  if (!select) return undefined
  if (!Array.isArray(select)) return select

  const result: Record<string, unknown> = {}

  for (const path of select) {
    if (!path || typeof path !== 'string') continue
    const segments = path.split('.').filter(Boolean)
    if (segments.length === 0) continue

    let cursor: Record<string, unknown> = result

    for (const [index, segment] of segments.entries()) {
      const isLeaf = index === segments.length - 1
      if (isLeaf) {
        cursor[segment] = true
      } else {
        const existing = cursor[segment]
        if (!existing || typeof existing !== 'object') {
          cursor[segment] = {}
        }
        cursor = cursor[segment] as Record<string, unknown>
      }
    }
  }

  return result as SelectType
}

/**
 * Generic Local API collection reader for server-side views and reusable data loaders.
 *
 * This is intentionally thin over `payload.find()` so teams can share a single
 * pattern for list/detail fetches without rewriting `select`, `pagination`,
 * `depth`, and `where` plumbing in every route.
 *
 * Typical uses:
 *
 * 1. Fetch a paginated list:
 * `await createView(payload, { collection: 'posts', limit: 12, sort: '-updatedAt' })`
 *
 * 2. Fetch one document by slug:
 * `await createView(payload, {
 *   collection: 'pages',
 *   limit: 1,
 *   pagination: false,
 *   where: { slug: { equals: 'about' } },
 * })`
 *
 * 3. Fetch only selected fields:
 * `await createView(payload, {
 *   collection: 'posts',
 *   select: ['id', 'title', 'slug', 'meta.description'],
 *   pagination: false,
 * })`
 *
 * Notes:
 * - This helper does not apply public/published filtering by itself.
 * - If you need visibility constraints, compose them into `where` or create a
 *   second helper on top of this one.
 */
export const createView = async <TSlug extends ViewCollectionSlug>(
  payload: Payload,
  args: CreateViewArgs<TSlug>,
): Promise<PaginatedDocs<CollectionDoc<TSlug>>> => {
  const { collection, select, trash = false, ...rest } = args
  const normalizedSelect = toSelectObject(select as SelectType | string[] | undefined)
  const find = payload.find as unknown as (args: GenericFindArgs) => Promise<unknown>

  const result = await find({
    collection,
    trash,
    ...rest,
    select: normalizedSelect,
  })

  return result as PaginatedDocs<CollectionDoc<TSlug>>
}
