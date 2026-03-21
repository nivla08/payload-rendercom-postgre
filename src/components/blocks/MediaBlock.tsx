import Image from 'next/image'

export type MediaDoc = {
  alt?: string
  caption?: string
  height?: number
  url?: string
  width?: number
}

export type MediaBlockData = {
  alignment?: 'center' | 'full' | 'left' | 'right'
  caption?: string
  media?: MediaDoc | number | string | null
}

const resolveMedia = (value: MediaBlockData['media']): MediaDoc | null => {
  if (!value || typeof value !== 'object') return null
  return value as MediaDoc
}

export const MediaBlock = ({ block }: { block: MediaBlockData }) => {
  const media = resolveMedia(block.media)
  if (!media?.url) return null

  return (
    <figure className={`starter-block starter-block--media starter-block--media-${block.alignment || 'center'}`}>
      <Image
        alt={media.alt || ''}
        height={typeof media.height === 'number' ? media.height : 900}
        src={media.url}
        unoptimized
        width={typeof media.width === 'number' ? media.width : 1600}
      />
      {block.caption || media.caption ? <figcaption>{block.caption || media.caption}</figcaption> : null}
    </figure>
  )
}
