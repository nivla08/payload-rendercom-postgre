type EmbedBlockData = {
  aspectRatio?: string
  caption?: string
  title?: string
  url?: string
}

export const EmbedBlock = ({ block }: { block: EmbedBlockData }) => {
  if (!block.url) return null

  return (
    <figure className="starter-block starter-block--embed">
      <div className="starter-block__embed-frame" style={{ aspectRatio: block.aspectRatio || '16 / 9' }}>
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
          src={block.url}
          title={block.title || 'Embedded content'}
        />
      </div>
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  )
}
