import { RichText, type RichTextContent } from '@/components/richtext'

export const RichTextBlock = ({ block }: { block: { content?: RichTextContent } }) => {
  return <RichText content={block.content} />
}
