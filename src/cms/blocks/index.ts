export { CTABlock } from './CTA'
export { CalloutBlock } from './Callout'
export { EmbedBlock } from './Embed'
export { MediaBlock } from './Media'
export { RichTextBlock } from './RichText'
export { ReusableBlockReferenceBlock } from './ReusableBlockReference'
export * from './contracts'

import { CTABlock } from './CTA'
import { CalloutBlock } from './Callout'
import { EmbedBlock } from './Embed'
import { MediaBlock } from './Media'
import { RichTextBlock } from './RichText'
import { ReusableBlockReferenceBlock } from './ReusableBlockReference'

export const PAGE_BLOCKS = [
  RichTextBlock,
  MediaBlock,
  CTABlock,
  EmbedBlock,
  CalloutBlock,
  ReusableBlockReferenceBlock,
] as const
