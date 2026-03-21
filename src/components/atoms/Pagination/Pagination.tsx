import Link from 'next/link'

import type { ViewPagination } from '@/lib/view-engine/pagination'
import styles from './styles.module.css'

type PaginationProps = {
  ariaLabel?: string
  buildPageHref: (page: number) => string
  className?: string
  pagination: ViewPagination
}

const getVisiblePages = (currentPage: number, totalPages: number): number[] => {
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, currentPage + 2)

  const pages: number[] = []
  for (let value = start; value <= end; value += 1) {
    pages.push(value)
  }

  return pages
}

/**
 * Reusable pagination UI for any server-rendered listing that exposes the
 * standard Payload pagination shape.
 *
 * Pair this with `buildPaginatedHref()` from `src/lib/view-engine/pagination.ts`.
 */
export function Pagination({
  ariaLabel = 'Pagination',
  buildPageHref,
  className,
  pagination,
}: PaginationProps) {
  if (pagination.totalPages <= 1) return null

  const pages = getVisiblePages(pagination.page, pagination.totalPages)
  const rootClassName = className ? `${styles.root} ${className}` : styles.root

  return (
    <nav aria-label={ariaLabel} className={rootClassName}>
      <span className={styles.meta}>
        Page {pagination.page} of {pagination.totalPages}
      </span>

      <div className={styles.controls}>
        {pagination.hasPrevPage ? (
          <Link className={styles.link} href={buildPageHref(pagination.page - 1)}>
            Previous
          </Link>
        ) : null}

        <ol className={styles.pages} aria-label="Pages">
          {pages.map((value) => {
            const isCurrent = value === pagination.page
            return (
              <li key={value}>
                {isCurrent ? (
                  <span className={`${styles.link} ${styles.linkActive}`} aria-current="page">
                    {value}
                  </span>
                ) : (
                  <Link className={styles.link} href={buildPageHref(value)}>
                    {value}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>

        {pagination.hasNextPage ? (
          <Link className={styles.link} href={buildPageHref(pagination.page + 1)}>
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
