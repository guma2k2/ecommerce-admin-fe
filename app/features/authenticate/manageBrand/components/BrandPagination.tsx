import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '~/core/components/shadcn/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/core/components/shadcn/select'

interface BrandPaginationProps {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (pageNumber: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export default function BrandPagination({
  pageNumber,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50]
}: BrandPaginationProps) {
  const { t } = useTranslation()
  const startItem = totalElements === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const endItem = Math.min(pageNumber * pageSize, totalElements)

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (pageNumber > 3) {
        pages.push('ellipsis')
      }

      const start = Math.max(2, pageNumber - 1)
      const end = Math.min(totalPages - 1, pageNumber + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (pageNumber < totalPages - 2) {
        pages.push('ellipsis')
      }
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2'>
      {/* Left side: Results summary & limit selector */}
      <div className='flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400'>
        <span>
          {t('pagination.showing', { start: startItem, end: endItem, total: totalElements })}
        </span>

        <div className='flex items-center gap-2 border-l border-gray-200 dark:border-zinc-800 pl-3'>
          <span className='whitespace-nowrap'>{t('pagination.perPage')}</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger size='sm' className='h-8 w-[70px] bg-white dark:bg-zinc-900'>
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right side: Page navigation buttons */}
      {totalPages > 1 && (
        <Pagination className='mx-0 w-auto'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault()
                  if (pageNumber > 1) onPageChange(pageNumber - 1)
                }}
                className={pageNumber <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {getPageNumbers().map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={pageNumber === p}
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault()
                  if (pageNumber < totalPages) onPageChange(pageNumber + 1)
                }}
                className={pageNumber >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
