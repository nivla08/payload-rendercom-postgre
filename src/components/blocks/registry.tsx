import React from 'react'

import { CTABlock, type CTABlockData } from './CTABlock'
import { CalloutBlock } from './CalloutBlock'
import { EmbedBlock } from './EmbedBlock'
import { MediaBlock, type MediaBlockData } from './MediaBlock'
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
  callout: ({ block }) => <CalloutBlock block={block as { body?: string; citation?: string; style?: 'callout' | 'quote'; title?: string }} />,
  cta: ({ block }) => <CTABlock block={block as CTABlockData} />,
  embed: ({ block }) => <EmbedBlock block={block as { aspectRatio?: string; caption?: string; title?: string; url?: string }} />,
  media: ({ block }) => <MediaBlock block={block as MediaBlockData} />,
  richText: ({ block }) => <RichTextBlock block={block as { content?: import('@/components/richtext').RichTextContent }} />,
}

const toRendererKey = (value: string): string =>
  value
    .trim()
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_\-.\s]+/g, ' ')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => {
      const normalized = part.charAt(0).toUpperCase() + part.slice(1)
      return index === 0 ? normalized.charAt(0).toLowerCase() + normalized.slice(1) : normalized
    })
    .join('')

/**
 * Resolve the React component used to render a Payload block by `blockType`.
 */
export const resolveBlockRenderer = (blockType: string | undefined): BlockComponent | null => {
  if (!blockType) return null

  return BLOCK_RENDERERS[blockType] ?? BLOCK_RENDERERS[toRendererKey(blockType)] ?? null
}
