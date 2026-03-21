import Link from 'next/link'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { Pagination } from '@/components/atoms/Pagination'
import { buildPageMetadata } from '@/lib/metadata'
import { listPosts } from '@/lib/content'
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
    description: 'Browse published posts from the CMS.',
    fallbackDescription: 'Browse published posts from the CMS.',
    fallbackTitle: 'Posts',
    title: 'Posts',
    type: 'website',
  })
}

export default async function PostsPage({ searchParams }: Props) {
  const { isEnabled } = await draftMode()
  const params = await searchParams
  const currentPage = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const result = await listPosts({
    draft: isEnabled,
    limit: 10,
    page: currentPage,
  })

  return (
    <section className="listing-page">
      <header className="content-header">
        <p className="content-kicker">Content Listing</p>
        <h1>Posts</h1>
        <p className="listing-intro">Published entries from the starter CMS, ready for teams to extend.</p>
      </header>

      {result.docs.length === 0 ? (
        <div className="emptyState">
          <p>No posts published yet.</p>
        </div>
      ) : (
        <>
          <div className="listing-grid">
            {result.docs.map((post) => {
              const slug = typeof post.slug === 'string' ? post.slug : ''
              const href = `/posts/${slug}`
              const excerpt = typeof post.excerpt === 'string' ? post.excerpt : ''
              const publishedAt = typeof post.publishedAt === 'string' ? post.publishedAt : null

              return (
                <article key={String(post.id)} className="listing-card">
                  <p className="listing-card-type">Post</p>
                  <h2>
                    <Link href={href}>{String(post.title ?? 'Untitled')}</Link>
                  </h2>
                  {excerpt ? <p className="listing-card-copy">{excerpt}</p> : null}
                  {publishedAt ? (
                    <time className="listing-card-meta" dateTime={publishedAt}>
                      {new Date(publishedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
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
                pathname: '/posts',
              })
            }
            pagination={result}
          />
        </>
      )}
    </section>
  )
}
