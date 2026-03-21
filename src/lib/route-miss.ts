import { notFound, permanentRedirect } from 'next/navigation'

import { findRedirectByPath } from './redirects'

/**
 * Shared miss handler for frontend routes:
 * - checks CMS-managed redirects first
 * - falls back to Next.js 404 when no redirect exists
 *
 * Example:
 * `return resolveRouteMiss('/posts/my-old-slug')`
 */
export const resolveRouteMiss = async (path: string, options: { draft?: boolean } = {}): Promise<never> => {
  const matchedRedirect = await findRedirectByPath(path, options)

  if (matchedRedirect) {
    permanentRedirect(matchedRedirect.to)
  }

  notFound()
}
