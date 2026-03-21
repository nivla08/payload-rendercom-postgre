import type { Payload } from 'payload'

import { REUSABLE_BLOCK_REFERENCE_SLUG, SHARED_BLOCKS_COLLECTION_SLUG } from '@/cms/blocks'

type GenericBlock = {
  blockType?: string
  shared?: number | string | { id?: number | string }
  [key: string]: unknown
}

type SharedBlocksFindResult = {
  docs?: Array<{ block?: unknown[]; id: number | string }>
}

type SharedBlocksReader = {
  find: (args: {
    collection: typeof SHARED_BLOCKS_COLLECTION_SLUG
    depth: number
    draft: boolean
    limit: number
    overrideAccess?: boolean
    where: Record<string, unknown>
  }) => Promise<SharedBlocksFindResult>
}

const isReusableBlock = (block: GenericBlock): boolean => block.blockType === REUSABLE_BLOCK_REFERENCE_SLUG

const readSharedID = (block: GenericBlock): null | number | string => {
  const shared = block.shared
  if (typeof shared === 'number' || typeof shared === 'string') return shared
  if (shared && typeof shared === 'object' && 'id' in shared) {
    return (shared as { id?: number | string }).id ?? null
  }

  return null
}

/**
 * Replace `reusableBlock` placeholders with the actual shared block payload.
 */
export async function resolveReusableBlocks(args: {
  blocks: GenericBlock[] | null | undefined
  draft?: boolean
  payload: Payload
}): Promise<GenericBlock[]> {
  const blocks = Array.isArray(args.blocks) ? args.blocks : []

  const sharedIDs = Array.from(
    new Set(
      blocks
        .filter(isReusableBlock)
        .map(readSharedID)
        .filter((id): id is number | string => id !== null && id !== undefined),
    ),
  )

  if (!sharedIDs.length) {
    return blocks.filter((block) => !isReusableBlock(block))
  }

  const sharedBlocksReader = args.payload as unknown as SharedBlocksReader
  const sharedResult = await sharedBlocksReader.find({
    collection: SHARED_BLOCKS_COLLECTION_SLUG,
    depth: 2,
    draft: args.draft ?? false,
    limit: sharedIDs.length,
    overrideAccess: args.draft ?? false,
    where: {
      id: {
        in: sharedIDs,
      },
    },
  })

  const sharedByID = new Map<string, { block?: unknown[] }>(
    (sharedResult.docs ?? []).map((doc) => [String(doc.id), doc]),
  )

  const resolvedBlocks: GenericBlock[] = []

  for (const block of blocks) {
    if (!isReusableBlock(block)) {
      resolvedBlocks.push(block)
      continue
    }

    const sharedID = readSharedID(block)
    if (!sharedID) continue

    const sharedDoc = sharedByID.get(String(sharedID))
    const actualBlock = Array.isArray(sharedDoc?.block) ? sharedDoc.block[0] : null

    if (actualBlock && typeof actualBlock === 'object' && 'blockType' in actualBlock) {
      resolvedBlocks.push(actualBlock as GenericBlock)
    }
  }

  return resolvedBlocks
}
