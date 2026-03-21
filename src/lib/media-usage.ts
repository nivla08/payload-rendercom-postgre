import type { PayloadRequest } from 'payload'

type DocLike = Record<string, unknown> | null | undefined

type MediaUsageEntry = {
  fieldPath: string
  sourceID: string
  sourceSlug: string
  sourceTitle: string
  sourceType: 'collection' | 'global'
}

type MediaUsageDoc = {
  id?: number | string
  usage?: MediaUsageEntry[] | null
}

type TrackPath = {
  mode?: 'deep' | 'direct'
  path: string
}

const DIRECT = 'direct' as const

const MEDIA_LIKE_KEYS = new Set(['featuredImage', 'image', 'media'])

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (Array.isArray(value)) return value
  if (value == null) return []
  return [value]
}

const readValueAtPath = (value: unknown, path: string): unknown => {
  const segments = path.split('.').filter(Boolean)
  let current: unknown = value

  for (const segment of segments) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

const readRelationID = (value: unknown): null | string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: number | string }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }

  return null
}

const collectDeepMediaIDs = (value: unknown, fieldPath: string, entries: Map<string, Set<string>>): void => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectDeepMediaIDs(item, fieldPath, entries))
    return
  }

  if (!value || typeof value !== 'object') return

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    const nestedPath = fieldPath ? `${fieldPath}.${key}` : key

    if (MEDIA_LIKE_KEYS.has(key)) {
      for (const candidate of asArray(nestedValue)) {
        const id = readRelationID(candidate)
        if (!id) continue
        const usagePaths = entries.get(id) ?? new Set<string>()
        usagePaths.add(nestedPath)
        entries.set(id, usagePaths)
      }
    }

    collectDeepMediaIDs(nestedValue, nestedPath, entries)
  }
}

const collectMediaEntries = (doc: DocLike, paths: TrackPath[]): Map<string, Set<string>> => {
  const collected = new Map<string, Set<string>>()
  if (!doc || typeof doc !== 'object') return collected

  for (const path of paths) {
    const value = readValueAtPath(doc, path.path)

    if ((path.mode ?? DIRECT) === DIRECT) {
      for (const candidate of asArray(value)) {
        const id = readRelationID(candidate)
        if (!id) continue
        const usagePaths = collected.get(id) ?? new Set<string>()
        usagePaths.add(path.path)
        collected.set(id, usagePaths)
      }
      continue
    }

    collectDeepMediaIDs(value, path.path, collected)
  }

  return collected
}

const getImpactedMediaIDs = (current: Map<string, Set<string>>, previous: Map<string, Set<string>>): string[] => {
  return Array.from(new Set([...current.keys(), ...previous.keys()]))
}

const sanitizeUsage = (value: unknown): MediaUsageEntry[] => {
  if (!Array.isArray(value)) return []

  return value.filter((entry): entry is MediaUsageEntry => {
    return (
      Boolean(entry) &&
      typeof entry === 'object' &&
      typeof (entry as MediaUsageEntry).fieldPath === 'string' &&
      typeof (entry as MediaUsageEntry).sourceID === 'string' &&
      typeof (entry as MediaUsageEntry).sourceSlug === 'string' &&
      typeof (entry as MediaUsageEntry).sourceTitle === 'string' &&
      ((entry as MediaUsageEntry).sourceType === 'collection' || (entry as MediaUsageEntry).sourceType === 'global')
    )
  })
}

const sourceKeyMatches = (entry: MediaUsageEntry, sourceSlug: string, sourceID: string): boolean => {
  return entry.sourceSlug === sourceSlug && entry.sourceID === sourceID
}

export const syncMediaUsage = async (args: {
  currentDoc?: DocLike
  previousDoc?: DocLike
  req: PayloadRequest
  sourceID: number | string
  sourceSlug: string
  sourceTitle: string
  sourceType: 'collection' | 'global'
  trackPaths: TrackPath[]
}): Promise<void> => {
  if (args.req.context?.skipMediaUsageSync) return

  const sourceID = String(args.sourceID)
  const currentEntries = collectMediaEntries(args.currentDoc, args.trackPaths)
  const previousEntries = collectMediaEntries(args.previousDoc, args.trackPaths)
  const impactedIDs = getImpactedMediaIDs(currentEntries, previousEntries)

  if (impactedIDs.length === 0 && !args.currentDoc && !args.previousDoc) {
    const existing = await args.req.payload.find({
      collection: 'media',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      req: args.req,
      where: {
        and: [
          {
            'usage.sourceID': {
              equals: sourceID,
            },
          },
          {
            'usage.sourceSlug': {
              equals: args.sourceSlug,
            },
          },
        ],
      },
    })

    impactedIDs.push(
      ...existing.docs
        .map((doc) => doc?.id)
        .filter((id) => typeof id === 'string' || typeof id === 'number')
        .map(String),
    )
  }

  for (const mediaID of impactedIDs) {
    const mediaDoc = (await args.req.payload.findByID({
      collection: 'media',
      id: mediaID,
      depth: 0,
      overrideAccess: true,
      req: args.req,
    }).catch(() => null)) as MediaUsageDoc | null

    if (!mediaDoc?.id) continue

    const existingUsage = sanitizeUsage(mediaDoc.usage).filter((entry) => {
      return !sourceKeyMatches(entry, args.sourceSlug, sourceID)
    })

    const nextPaths = currentEntries.get(mediaID) ?? new Set<string>()
    const nextUsage = [
      ...existingUsage,
      ...Array.from(nextPaths).map((fieldPath) => ({
        fieldPath,
        sourceID,
        sourceSlug: args.sourceSlug,
        sourceTitle: args.sourceTitle,
        sourceType: args.sourceType,
      })),
    ]

    await (args.req.payload.update as unknown as (options: Record<string, unknown>) => Promise<unknown>)({
      collection: 'media',
      id: mediaDoc.id,
      data: {
        usage: nextUsage,
      },
      overrideAccess: true,
      req: args.req,
      context: {
        ...args.req.context,
        skipMediaUsageSync: true,
      },
    })
  }
}
