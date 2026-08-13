import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { Button } from '~/core/components/shadcn/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/core/components/shadcn/select'

interface MediaPaginationProps {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (pageNumber: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export default function MediaPagination({
  pageNumber,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange
}: MediaPaginationProps) {
  const startItem = totalElements === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const endItem = Math.min(pageNumber * pageSize, totalElements)

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-2xs text-xs'>
      {/* Total items info */}
      <div className='text-muted-foreground font-mono'>
        Showing <span className='font-semibold text-gray-900 dark:text-gray-100'>{startItem}</span> to{' '}
        <span className='font-semibold text-gray-900 dark:text-gray-100'>{endItem}</span> of{' '}
        <span className='font-semibold text-gray-900 dark:text-gray-100'>{totalElements}</span> items
      </div>

      {/* Right side controls */}
      <div className='flex items-center gap-6'>
        {/* Limit selector */}
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground whitespace-nowrap'>Rows per page:</span>
          <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
            <SelectTrigger className='h-8 w-[70px] text-xs bg-gray-50/50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='5'>5</SelectItem>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='20'>20</SelectItem>
              <SelectItem value='50'>50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page controls */}
        <div className='flex items-center gap-1'>
          <span className='mr-2 text-muted-foreground font-mono'>
            Page {pageNumber} of {totalPages}
          </span>
          <Button
            variant='outline'
            size='icon'
            className='size-7'
            onClick={() => onPageChange(1)}
            disabled={pageNumber <= 1}
          >
            <ChevronsLeft className='size-3.5' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-7'
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className='size-3.5' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-7'
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
          >
            <ChevronRight className='size-3.5' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-7'
            onClick={() => onPageChange(totalPages)}
            disabled={pageNumber >= totalPages}
          >
            <ChevronsRight className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  )
}
