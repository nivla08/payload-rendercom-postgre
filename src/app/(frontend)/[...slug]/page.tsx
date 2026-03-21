import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { RichText, type RichTextContent } from '@/components/richtext'
import { buildPageMetadata, toPlainText } from '@/lib/metadata'
import { getSiteSettings } from '@/lib/site-settings'
import { resolvePageByPath } from '@/lib/content'
import { resolveRouteMiss } from '@/lib/route-miss'

type Props = {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled } = await draftMode()
  const { slug } = await params
  const resolvedPath = `/${slug.join('/')}`
  const [page, settings] = await Promise.all([resolvePageByPath(resolvedPath, { draft: isEnabled }), getSiteSettings()])

  if (!page) {
    return buildPageMetadata({
      defaults: settings.meta,
      description: 'The requested page could not be found.',
      fallbackDescription: 'The requested page could not be found.',
      fallbackTitle: 'Page Not Found',
      noindex: true,
      title: 'Page Not Found',
      type: 'website',
    })
  }

  const meta = (page.meta ?? {}) as { description?: string; image?: unknown; noindex?: boolean; title?: string }
  const fallbackTitle = toPlainText(page.title, 'Untitled')

  return buildPageMetadata({
    defaults: settings.meta,
    description: meta.description,
    fallbackDescription: `Read ${fallbackTitle}`,
    fallbackTitle,
    image: meta.image,
    noindex: meta.noindex,
    title: meta.title ?? fallbackTitle,
    type: 'website',
  })
}

export default async function CatchAllPage({ params }: Props) {
  const { isEnabled } = await draftMode()
  const { slug } = await params
  const resolvedPath = `/${slug.join('/')}`
  const page = await resolvePageByPath(resolvedPath, { draft: isEnabled })

  if (!page) {
    return resolveRouteMiss(resolvedPath, { draft: isEnabled })
  }

  return (
    <article className="content-page">
      <header className="content-header">
        <p className="content-kicker">Page</p>
        <h1>{String(page.title ?? '')}</h1>
      </header>

      <div className="content-body">
        <RichText content={page.layout as RichTextContent} />
      </div>
    </article>
  )
}
