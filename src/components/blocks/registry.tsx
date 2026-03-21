import React from 'react'

import { RichTextBlock } from './RichTextBlock'
import type { GenericBlockData } from './types'

export type BlockComponent<TBlock extends GenericBlockData = GenericBlockData> = (props: {
  block: TBlock
}) => React.JSX.Element | null

/**
 * Starter block registry.
 *
 * Keep this empty until a project adds concrete frontend block components.
 *
 * Example:
 * `hero: ({ block }) => <HeroBlock block={block as HeroBlockData} />`
 */
export const BLOCK_RENDERERS: Record<string, BlockComponent> = {
  richText: ({ block }) => <RichTextBlock block={block as { content?: import('@/components/richtext').RichTextContent }} />,
}

/**
 * Resolve the React component used to render a Payload block by `blockType`.
 */
export const resolveBlockRenderer = (blockType: string | undefined): BlockComponent | null => {
  if (!blockType) return null
  return BLOCK_RENDERERS[blockType] ?? null
}
