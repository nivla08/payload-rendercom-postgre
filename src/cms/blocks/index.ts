export { RichTextBlock } from './RichText'
export { ReusableBlockReferenceBlock } from './ReusableBlockReference'
export * from './contracts'

import { RichTextBlock } from './RichText'
import { ReusableBlockReferenceBlock } from './ReusableBlockReference'

export const PAGE_BLOCKS = [RichTextBlock, ReusableBlockReferenceBlock] as const
