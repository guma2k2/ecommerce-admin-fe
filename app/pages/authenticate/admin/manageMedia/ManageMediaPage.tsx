import * as React from 'react'
import { useLoaderData, useSearchParams, useNavigation, useNavigate } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { Image, Plus, Loader2, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import {
  getMediaList,
  updateMediaItemName,
  deleteMediaItem
} from '~/features/authenticate/manageMedia/services/mediaService'
import type { MediaItem } from '~/features/authenticate/manageMedia/types'
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
  const page = Number(url.searchParams.get('page') || '1')
  const limit = Number(url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || ''
  const type = url.searchParams.get('type') || 'all'

  const response = await getMediaList({ page, limit, search, type })
  return {
    ...response,
    searchParams: { page, limit, search, type }
  }
}

clientLoader.hydrate = true as const

export default function ManageMediaPage() {
  const { data, pagination, searchParams: currentParams } = useLoaderData<typeof clientLoader>()
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()

  // Local state for UI controls
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table')
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState<boolean>(false)
  const [previewMedia, setPreviewMedia] = React.useState<MediaItem | null>(null)
  
  // State for Edit Name dialog
  const [editingMedia, setEditingMedia] = React.useState<MediaItem | null>(null)
  const [editNameValue, setEditNameValue] = React.useState<string>('')
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false)

  // State for Delete confirmation dialog
  const [deletingMedia, setDeletingMedia] = React.useState<MediaItem | null>(null)
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false)

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
      next.set('page', '1')
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
      next.set('page', '1')
      return next
    })
  }

  const handleResetFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('search')
      next.delete('type')
      next.set('page', '1')
      return next
    })
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }

  const handleLimitChange = (newLimit: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('limit', String(newLimit))
      next.set('page', '1')
      return next
    })
  }

  // Edit Name Submit
  const handleConfirmEditName = async () => {
    if (!editingMedia || !editNameValue.trim()) return

    try {
      setIsUpdating(true)
      await updateMediaItemName(editingMedia.id, editNameValue.trim())
      toast.success(`Updated file name to "${editNameValue.trim()}"`)
      setEditingMedia(null)
      // Refresh current route data
      navigate('.', { replace: true })
    } catch (err) {
      console.error('Update name error:', err)
      toast.error('Failed to update file name.')
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
      toast.success(`Deleted media file ${deletingMedia.name}`)
      setDeletingMedia(null)
      // Refresh current route data
      navigate('.', { replace: true })
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete media file.')
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
              {pagination.totalItems} Items
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
            mediaList={data}
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
            mediaList={data}
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
          page={pagination.page}
          limit={pagination.limit}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
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
