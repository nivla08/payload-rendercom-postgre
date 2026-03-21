import Link from 'next/link'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { Pagination } from '@/components/atoms/Pagination'
import { buildPageMetadata } from '@/lib/metadata'
import { listPages } from '@/lib/content'
import { getSiteSettings } from '@/lib/site-settings'
import { buildPaginatedHref } from '@/lib/view-engine/pagination'

type Props = {
  searchParams: Promise<{
    page?: string
  }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return buildPageMetadata({
    defaults: settings.meta,
    description: 'Browse published pages from the CMS.',
    fallbackDescription: 'Browse published pages from the CMS.',
    fallbackTitle: 'Pages',
    title: 'Pages',
    type: 'website',
  })
}

export default async function PagesPage({ searchParams }: Props) {
  const { isEnabled } = await draftMode()
  const params = await searchParams
  const currentPage = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const result = await listPages({
    draft: isEnabled,
    limit: 10,
    page: currentPage,
  })

  return (
    <section className="listing-page">
      <header className="content-header">
        <p className="content-kicker">Content Listing</p>
        <h1>Pages</h1>
        <p className="listing-intro">Published pages from the CMS. The front page is intentionally omitted here.</p>
      </header>

      {result.docs.length === 0 ? (
        <div className="emptyState">
          <p>No pages published yet.</p>
        </div>
      ) : (
        <>
          <div className="listing-grid">
            {result.docs.map((page) => {
              const slug = typeof page.slug === 'string' ? page.slug : ''
              const href = slug.startsWith('/') ? slug : `/${slug}`
              const updatedAt = typeof page.updatedAt === 'string' ? page.updatedAt : null

              return (
                <article key={String(page.id)} className="listing-card">
                  <p className="listing-card-type">Page</p>
                  <h2>
                    <Link href={href}>{String(page.title ?? 'Untitled')}</Link>
                  </h2>
                  <p className="listing-card-copy">Slug: {href}</p>
                  {updatedAt ? (
                    <time className="listing-card-meta" dateTime={updatedAt}>
                      Updated {new Date(updatedAt).toLocaleDateString('en-US')}
                    </time>
                  ) : null}
                </article>
              )
            })}
          </div>

          <Pagination
            buildPageHref={(page) =>
              buildPaginatedHref({
                page,
                pathname: '/pages',
              })
            }
            pagination={result}
          />
        </>
      )}
    </section>
  )
}
