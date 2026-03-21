export type ViewPagination = {
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
  page: number
  totalDocs: number
  totalPages: number
}

type BuildPaginatedHrefArgs = {
  page: number
  pageParam?: string
  pathname: string
  searchParams?: URLSearchParams
}

/**
 * Build a canonical paginated URL while preserving the current query string.
 *
 * Use this with `Pagination` or custom listing UIs.
 *
 * Example:
 * `buildPaginatedHref({ pathname: '/posts', page: 2, searchParams })`
 * => `/posts?page=2`
 *
 * Example with page 1:
 * `buildPaginatedHref({ pathname: '/posts', page: 1, searchParams })`
 * => `/posts`
 */
export const buildPaginatedHref = ({
  page,
  pageParam = 'page',
  pathname,
  searchParams,
}: BuildPaginatedHrefArgs): string => {
  const params = new URLSearchParams(searchParams)

  if (page <= 1) {
    params.delete(pageParam)
  } else {
    params.set(pageParam, String(page))
  }

  const query = params.toString()
  return query.length > 0 ? `${pathname}?${query}` : pathname
}
