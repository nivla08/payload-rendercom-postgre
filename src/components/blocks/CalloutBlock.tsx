type CalloutBlockData = {
  body?: string
  citation?: string
  style?: 'callout' | 'quote'
  title?: string
}

export const CalloutBlock = ({ block }: { block: CalloutBlockData }) => {
  if (!block.body) return null

  if (block.style === 'quote') {
    return (
      <blockquote className="starter-block starter-block--quote">
        <p>{block.body}</p>
        {block.citation ? <footer>{block.citation}</footer> : null}
      </blockquote>
    )
  }

  return (
    <aside className="starter-block starter-block--callout">
      {block.title ? <strong>{block.title}</strong> : null}
      <p>{block.body}</p>
    </aside>
  )
}
