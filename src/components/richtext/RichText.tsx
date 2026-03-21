type RichTextChild = {
  text?: string
}

type RichTextNode = {
  children?: RichTextChild[]
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'li' | 'ol' | 'p' | 'quote' | 'ul'
  type?: string
}

export type RichTextContent = {
  root?: {
    children?: RichTextNode[]
  }
}

const renderNode = (node: RichTextNode, index: number) => {
  const children = node.children?.map((child, childIndex) => <span key={childIndex}>{child.text}</span>) ?? null

  switch (node.tag) {
    case 'h1':
      return <h1 key={index}>{children}</h1>
    case 'h2':
      return <h2 key={index}>{children}</h2>
    case 'h3':
      return <h3 key={index}>{children}</h3>
    case 'h4':
      return <h4 key={index}>{children}</h4>
    case 'ol':
      return <ol key={index}>{children}</ol>
    case 'ul':
      return <ul key={index}>{children}</ul>
    case 'li':
      return <li key={index}>{children}</li>
    case 'quote':
      return <blockquote key={index}>{children}</blockquote>
    case 'p':
    default:
      return <p key={index}>{children}</p>
  }
}

/**
 * Lightweight Lexical rich-text renderer for starter pages and posts.
 *
 * This intentionally covers the common text-node cases used by the starter.
 * Projects can replace it later with a richer renderer as their content model grows.
 */
export const RichText = ({ content }: { content?: RichTextContent | null }) => {
  const nodes = content?.root?.children
  if (!Array.isArray(nodes) || nodes.length === 0) return null

  return <>{nodes.map(renderNode)}</>
}
