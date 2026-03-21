import React from 'react'

import { resolveBlockRenderer } from './registry'
import type { GenericBlockData } from './types'

type Props = {
  blocks?: GenericBlockData[] | null
}

/**
 * Shared block renderer for Payload block arrays.
 *
 * Use this in frontend routes once a project has registered block components in
 * `registry.tsx`.
 */
export const RenderBlocks = ({ blocks }: Props) => {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id || `${block.blockType || 'block'}-${index}`
        const BlockRenderer = resolveBlockRenderer(block.blockType)
        if (!BlockRenderer) return null
        return <BlockRenderer key={key} block={block} />
      })}
    </>
  )
}
