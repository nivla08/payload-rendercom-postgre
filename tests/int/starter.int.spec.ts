import { describe, expect, it } from 'vitest'

import { buildPageMetadata } from '@/lib/metadata'
import { buildLinks, toFooterDTO, toHeaderDTO } from '@/lib/navigation'
import { matchesMaintenancePath } from '@/lib/site-settings'

describe('starter helpers', () => {
  it('matches exact, prefix, and wildcard maintenance allowlist patterns', () => {
    expect(matchesMaintenancePath('/about', '/about')).toBe(true)
    expect(matchesMaintenancePath('/posts/hello-world', '/posts')).toBe(true)
    expect(matchesMaintenancePath('/posts/hello-world', '/posts/*')).toBe(true)
    expect(matchesMaintenancePath('/anything', '*')).toBe(true)
    expect(matchesMaintenancePath('/about', '/contact')).toBe(false)
  })

  it('uses site defaults only when document metadata is missing', () => {
    const metadata = buildPageMetadata({
      defaults: {
        description: 'Default description',
        image: '/default.png',
        title: 'Default title',
      },
      fallbackDescription: 'Fallback description',
      fallbackTitle: 'Fallback title',
      title: '',
      description: null,
      image: null,
    })

    expect(metadata.title).toBe('Default title')
    expect(metadata.description).toBe('Default description')
    const ogImages = Array.isArray(metadata.openGraph?.images) ? metadata.openGraph.images : []
    expect(ogImages[0]).toMatchObject({ url: '/default.png' })

    const documentMetadata = buildPageMetadata({
      defaults: {
        description: 'Default description',
        title: 'Default title',
      },
      description: 'Document description',
      fallbackDescription: 'Fallback description',
      fallbackTitle: 'Fallback title',
      title: 'Document title',
    })

    expect(documentMetadata.title).toBe('Document title')
    expect(documentMetadata.description).toBe('Document description')
  })

  it('builds stable DTOs from header and footer docs', () => {
    const header = toHeaderDTO({
      navigation: [
        {
          label: 'Posts',
          link: {
            reference: { slug: 'posts' },
            type: 'internal',
          },
          childrenLevel1: [
            {
              label: 'Hello',
              link: {
                type: 'custom',
                url: '/posts/hello',
              },
            },
          ],
        },
      ],
      siteName: 'Starter',
    })

    expect(header.siteName).toBe('Starter')
    expect(header.navigation[0]).toMatchObject({ href: '/posts', label: 'Posts' })
    expect(header.navigation[0].children?.[0]).toMatchObject({ href: '/posts/hello', level: 2 })

    const footer = toFooterDTO({
      columns: [
        {
          links: [
            {
              label: 'Docs',
              link: {
                type: 'custom',
                url: '/docs',
              },
            },
          ],
          title: 'Resources',
        },
      ],
      legal: {
        copyright: '2026',
      },
      tagline: 'Reusable starter',
    })

    expect(footer.columns[0]).toMatchObject({ title: 'Resources' })
    expect(footer.columns[0]?.links[0]).toMatchObject({ href: '/docs', label: 'Docs' })
    expect(footer.legal.copyright).toBe('2026')

    const nested = buildLinks([
      {
        label: 'Home',
        link: {
          type: 'custom',
          url: '/',
        },
      },
    ])

    expect(nested).toHaveLength(1)
  })
})
