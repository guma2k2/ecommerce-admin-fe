import { useState } from 'react'
import { useLoaderData, useSearchParams, useNavigation, useNavigate } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { Image, Plus, Loader2, Trash2, Pencil } from 'lucide-react'

import {
  getMediaList,
  updateMediaItemName,
  deleteMediaItem
} from '~/shared/services/api/mediaService'
import type { MediaItem } from '~/features/authenticate/manageMedia/types'
import { showToast } from '~/shared/utils/toast'
import MediaFilter from '~/features/authenticate/manageMedia/components/MediaFilter'
import MediaTable from '~/features/authenticate/manageMedia/components/MediaTable'
import MediaGridView from '~/features/authenticate/manageMedia/components/MediaGridView'
import MediaPagination from '~/features/authenticate/manageMedia/components/MediaPagination'
import MediaUploadDialog from '~/features/authenticate/manageMedia/components/MediaUploadDialog'
import MediaPreviewModal from '~/features/authenticate/manageMedia/components/MediaPreviewModal'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import { Input } from '~/core/components/shadcn/input'
import { Label } from '~/core/components/shadcn/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/core/components/shadcn/dialog'

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const pageNumber = Number(url.searchParams.get('pageNumber') || url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || ''
  const type = url.searchParams.get('type') || 'all'
  const sortField = url.searchParams.get('sortField') || undefined
  const sortDir = (url.searchParams.get('sortDir') || undefined) as any

  const response = await getMediaList({ pageNumber, pageSize, search, type, sortField, sortDir })
  return {
    ...response,
    searchParams: { pageNumber, pageSize, search, type, sortField, sortDir }
  }
}

clientLoader.hydrate = true as const

export default function ManageMediaPage() {
  const pageData = useLoaderData<typeof clientLoader>()
  const { content, pageNumber, pageSize, totalElements, totalPages, searchParams: currentParams } = pageData
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()

  // Local state for UI controls
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false)
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null)
  
  // State for Edit Name dialog
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null)
  const [editNameValue, setEditNameValue] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  // State for Delete confirmation dialog
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const isLoading = navigation.state === 'loading' || navigation.state === 'submitting'

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

  // Edit Name Submit
  const handleConfirmEditName = async () => {
    if (!editingMedia || !editNameValue.trim()) return

    try {
      setIsUpdating(true)
      await updateMediaItemName(editingMedia.id, editNameValue.trim())
      showToast('success', 'toasts.mediaUpdated')
      setEditingMedia(null)
      // Refresh current route data
      navigate('.', { replace: true })
    } catch (err) {
      console.error('Update name error:', err)
      showToast('error', 'toasts.mediaUpdateFailed')
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete Confirm Submit
  const handleConfirmDelete = async () => {
    if (!deletingMedia) return

    try {
      setIsDeleting(true)
      await deleteMediaItem(deletingMedia.id)
      showToast('success', 'toasts.mediaDeleted')
      setDeletingMedia(null)
      // Refresh current route data
      navigate('.', { replace: true })
    } catch (err) {
      console.error('Delete error:', err)
      showToast('error', 'toasts.mediaDeleteFailed')
    } finally {
      setIsDeleting(false)
    }
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
              {totalElements} Items
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>
            Upload, organize, inspect specifications (ID, Name, URL, Size, Type, Dates), and manage all your digital media assets.
          </p>
        </div>

        <Button onClick={() => setUploadDialogOpen(true)} size='default' className='shadow-xs gap-1.5 self-start sm:self-auto'>
          <Plus className='size-4' />
          Upload Media
        </Button>
      </div>

      {/* Main Content Area */}
      <div className='space-y-4'>
        {/* Search, Filter & View Toggle Bar */}
        <MediaFilter
          searchValue={currentParams.search}
          onSearchChange={handleSearchChange}
          typeValue={currentParams.type}
          onTypeChange={handleTypeChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
        />

        {/* Media Data Render (Table View vs Grid View) */}
        {viewMode === 'table' ? (
          <MediaTable
            mediaList={content}
            isLoading={isLoading}
            onPreview={(item) => setPreviewMedia(item)}
            onEdit={(item) => {
              setEditingMedia(item)
              setEditNameValue(item.name)
            }}
            onDelete={(item) => setDeletingMedia(item)}
          />
        ) : (
          <MediaGridView
            mediaList={content}
            isLoading={isLoading}
            onPreview={(item) => setPreviewMedia(item)}
            onEdit={(item) => {
              setEditingMedia(item)
              setEditNameValue(item.name)
            }}
            onDelete={(item) => setDeletingMedia(item)}
          />
        )}

        {/* Pagination Controls */}
        <MediaPagination
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Upload Dialog */}
      <MediaUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => {
          navigate('.', { replace: true })
        }}
      />

      {/* Lightbox Details Preview Modal */}
      <MediaPreviewModal
        media={previewMedia}
        open={Boolean(previewMedia)}
        onOpenChange={(open) => {
          if (!open) setPreviewMedia(null)
        }}
      />

      {/* Edit Name Dialog */}
      <Dialog open={Boolean(editingMedia)} onOpenChange={(open) => { if (!open) setEditingMedia(null) }}>
        <DialogContent className='sm:max-w-[420px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
              <Pencil className='size-5 text-amber-500' />
              Edit Media Name
            </DialogTitle>
            <DialogDescription>
              Update the display name for media asset <span className='font-mono text-xs font-semibold'>({editingMedia?.id})</span>.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2 py-3'>
            <Label htmlFor='edit-name' className='text-xs font-medium'>
              File Name
            </Label>
            <Input
              id='edit-name'
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              placeholder='Enter new name'
              className='h-9'
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setEditingMedia(null)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEditName} disabled={!editNameValue.trim() || isUpdating} className='gap-1.5'>
              {isUpdating ? <Loader2 className='size-4 animate-spin' /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deletingMedia)} onOpenChange={(open) => { if (!open) setDeletingMedia(null) }}>
        <DialogContent className='sm:max-w-[420px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold text-red-600'>
              <Trash2 className='size-5' />
              Delete Media Asset?
            </DialogTitle>
            <DialogDescription className='space-y-2 pt-2'>
              <span>Are you sure you want to permanently delete this media item?</span>
              {deletingMedia && (
                <div className='p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/40 text-xs space-y-1 font-mono text-red-900 dark:text-red-300'>
                  <p><strong className='font-sans'>Name:</strong> {deletingMedia.name}</p>
                  <p><strong className='font-sans'>ID:</strong> {deletingMedia.id}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='gap-2 sm:gap-0 pt-2'>
            <Button variant='outline' onClick={() => setDeletingMedia(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleConfirmDelete} disabled={isDeleting} className='gap-1.5'>
              {isDeleting ? <Loader2 className='size-4 animate-spin' /> : 'Delete Media'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
