import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Image, Plus, RefreshCw, AlertCircle } from 'lucide-react'

import { useMediaPage, useUploadMedia } from '~/shared/hooks/queries/useMediaQuery'
import type { MediaResponse } from '~/shared/types'
import MediaFilter from '~/features/authenticate/manageMedia/components/MediaFilter'
import MediaTable from '~/features/authenticate/manageMedia/components/MediaTable'
import MediaGridView from '~/features/authenticate/manageMedia/components/MediaGridView'
import MediaPagination from '~/features/authenticate/manageMedia/components/MediaPagination'
import MediaUploadDialog from '~/features/authenticate/manageMedia/components/MediaUploadDialog'
import MediaPreviewModal from '~/features/authenticate/manageMedia/components/MediaPreviewModal'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'

export default function ManageMediaPage() {

  const [searchParams, setSearchParams] = useSearchParams()

  // Extract query parameters (UI uses 1-based pageNumber)
  const pageNumberParam = Number(searchParams.get('pageNumber') || searchParams.get('page') || '1')
  const pageSizeParam = Number(searchParams.get('pageSize') || searchParams.get('limit') || '10')
  const searchParam = searchParams.get('search') || ''
  const typeParam = searchParams.get('type') || 'all'

  // Backend API uses zero-based pageNumber index
  const zeroBasedPageNumber = Math.max(0, pageNumberParam - 1)

  // React Query hook for fetching media
  const { data, isLoading, isFetching, isError, error, refetch } = useMediaPage({
    pageNumber: zeroBasedPageNumber,
    pageSize: pageSizeParam,
    search: searchParam,
    type: typeParam !== 'all' ? typeParam : undefined
  })

  // React Query mutation for uploading media
  const uploadMutation = useUploadMedia({
    onSuccess: () => {
      setUploadDialogOpen(false)
      refetch()
    }
  })

  // Extract paginated media data
  const content = data?.content || []
  const totalElements = data?.totalElements || 0
  const totalPages = data?.totalPages || 1
  const currentPage = (data?.pageNumber !== undefined ? data.pageNumber + 1 : pageNumberParam)

  // Local state for UI controls
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false)
  const [previewMedia, setPreviewMedia] = useState<MediaResponse | null>(null)

  // Handlers for URL search parameter updates
  const handleSearchChange = (newSearch: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newSearch) {
        next.set('search', newSearch)
      } else {
        next.delete('search')
      }
      next.set('pageNumber', '1')
      return next
    })
  }

  const handleTypeChange = (newType: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newType && newType !== 'all') {
        next.set('type', newType)
      } else {
        next.delete('type')
      }
      next.set('pageNumber', '1')
      return next
    })
  }

  const handleResetFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('search')
      next.delete('type')
      next.set('pageNumber', '1')
      return next
    })
  }

  const handlePageChange = (newPageNumber: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('pageNumber', String(newPageNumber))
      return next
    })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('pageSize', String(newPageSize))
      next.set('pageNumber', '1')
      return next
    })
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Top Header section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2.5'>
            <Image className='size-7 text-primary' />
            <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50'>
              Media Management
            </h1>
            <Badge variant='secondary' className='ml-1 font-semibold text-xs'>
              {totalElements} Assets
            </Badge>
            {isFetching && !isLoading && (
              <RefreshCw className='size-3.5 text-muted-foreground animate-spin' />
            )}
          </div>
          <p className='text-sm text-muted-foreground'>
            Upload, organize, inspect specifications, and manage digital media assets (images & videos).
          </p>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            disabled={isFetching}
            className='gap-1.5 h-9'
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setUploadDialogOpen(true)}
            size='default'
            className='shadow-xs gap-1.5'
          >
            <Plus className='size-4' />
            Upload Media
          </Button>
        </div>
      </div>

      {/* Error state alert if request fails */}
      {isError && (
        <div className='p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-800 dark:text-red-300 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='size-4 text-red-600 shrink-0' />
            <span>{error?.message || 'Could not fetch media list from server.'}</span>
          </div>
          <Button variant='outline' size='sm' onClick={() => refetch()} className='h-7 text-xs border-red-300 dark:border-red-800 bg-white dark:bg-zinc-900'>
            Try Again
          </Button>
        </div>
      )}


      {/* Main Content Area */}
      <div className='space-y-4'>
        {/* Search, Filter & View Toggle Bar */}
        <MediaFilter
          searchValue={searchParam}
          onSearchChange={handleSearchChange}
          typeValue={typeParam}
          onTypeChange={handleTypeChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
          isLoading={isLoading || isFetching}
        />

        {/* Media Data Render (Table View vs Grid View) */}
        {viewMode === 'table' ? (
          <MediaTable
            mediaList={content}
            isLoading={isLoading}
            onPreview={(item) => setPreviewMedia(item)}
          />
        ) : (
          <MediaGridView
            mediaList={content}
            isLoading={isLoading}
            onPreview={(item) => setPreviewMedia(item)}
          />
        )}

        {/* Pagination Controls */}
        <MediaPagination
          pageNumber={currentPage}
          pageSize={pageSizeParam}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Upload Dialog with Live Progress and Alt Text */}
      <MediaUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={async (payload) => {
          await uploadMutation.mutateAsync(payload)
        }}
        isUploading={uploadMutation.isPending}
      />

      {/* Lightbox Details Preview Modal */}
      <MediaPreviewModal
        media={previewMedia}
        open={Boolean(previewMedia)}
        onOpenChange={(open) => {
          if (!open) setPreviewMedia(null)
        }}
      />
    </div>
  )
}

