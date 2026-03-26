import Link from 'next/link'

import { resolveStructuredLinkHref, type StructuredLinkValue } from '@/lib/links'

export type CTAAction = {
  id?: number | string
  label?: string
  link?: StructuredLinkValue
}

export type CTABlockData = {
  actions?: CTAAction[]
  copy?: string
  eyebrow?: string
  title?: string
}

export const CTABlock = ({ block }: { block: CTABlockData }) => {
  const actions = (block.actions ?? []).reduce<Array<{ href: string; id?: number | string; label: string; newTab: boolean }>>(
    (acc, action) => {
      const href = resolveStructuredLinkHref(action.link)
      if (!href) return acc

      acc.push({
        href,
        id: action.id,
        label: typeof action.label === 'string' && action.label.trim() ? action.label.trim() : 'Learn more',
        newTab: Boolean(action.link?.newTab),
      })

      return acc
    },
    [],
  )

  if (!block.title && !block.copy && actions.length === 0) return null

  return (
    <section className="starter-block starter-block--cta">
      {block.eyebrow ? <p className="starter-block__eyebrow">{block.eyebrow}</p> : null}
      {block.title ? <h2>{block.title}</h2> : null}
      {block.copy ? <p className="starter-block__copy">{block.copy}</p> : null}
      {actions.length > 0 ? (
        <div className="starter-block__actions">
          {actions.map((action, index) => {
            const key = action.id ?? `${action.href}-${index}`

            if (action.href.startsWith('/')) {
              return (
                <Link key={key} className="starter-block__action starter-block__action--primary" href={action.href}>
                  {action.label}
                </Link>
              )
            }

            return (
              <a
                key={key}
                className="starter-block__action starter-block__action--primary"
                href={action.href}
                rel={action.newTab ? 'noreferrer' : undefined}
                target={action.newTab ? '_blank' : undefined}
              >
                {action.label}
              </a>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
