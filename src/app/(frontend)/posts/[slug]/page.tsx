import Link from 'next/link'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { RichText, type RichTextContent } from '@/components/richtext'
import { buildPageMetadata, toPlainText } from '@/lib/metadata'
import { getPostBySlug } from '@/lib/content'
import { resolveRouteMiss } from '@/lib/route-miss'
import { getSiteSettings } from '@/lib/site-settings'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled } = await draftMode()
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug, { draft: isEnabled }), getSiteSettings()])

  if (!post) {
    return buildPageMetadata({
      defaults: settings.meta,
      description: 'The requested post could not be found.',
      fallbackDescription: 'The requested post could not be found.',
      fallbackTitle: 'Post Not Found',
      noindex: true,
      title: 'Post Not Found',
      type: 'article',
    })
  }

  const meta = (post.meta ?? {}) as { description?: string; image?: unknown; noindex?: boolean; title?: string }
  const fallbackTitle = toPlainText(post.title, 'Untitled')
  const fallbackDescription = toPlainText(post.excerpt, `Read ${fallbackTitle}`)

  return buildPageMetadata({
    defaults: settings.meta,
    description: meta.description ?? post.excerpt,
    fallbackDescription,
    fallbackTitle,
    image: meta.image ?? post.featuredImage,
    noindex: meta.noindex,
    title: meta.title ?? fallbackTitle,
    type: 'article',
  })
}

export default async function PostPage({ params }: Props) {
  const { isEnabled } = await draftMode()
  const { slug } = await params
  const post = await getPostBySlug(slug, { draft: isEnabled })

  if (!post) {
    return resolveRouteMiss(`/posts/${slug}`, { draft: isEnabled })
  }

  const publishedAt = typeof post.publishedAt === 'string' ? post.publishedAt : null

  return (
    <article className="content-page">
      <header className="content-header">
        <Link className="back-link" href="/posts">
          Back to Posts
        </Link>
        <p className="content-kicker">Post</p>
        <h1>{String(post.title ?? '')}</h1>
        {publishedAt ? (
          <time className="listing-card-meta" dateTime={publishedAt}>
            {new Date(publishedAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        ) : null}
      </header>

      {typeof post.excerpt === 'string' && post.excerpt ? <p className="lead">{post.excerpt}</p> : null}

      <div className="content-body">
        <RichText content={post.content as RichTextContent} />
      </div>
    </article>
  )
}
