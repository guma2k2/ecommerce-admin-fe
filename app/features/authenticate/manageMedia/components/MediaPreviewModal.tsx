import { useState } from 'react'
import {
  Copy,
  ExternalLink,
  Video,
  FileImage,
  Calendar,
  HardDrive,
  Hash,
  Check,
  File,
  Type,
  Clock,
  Sparkles
} from 'lucide-react'
import { showToast } from '~/shared/utils/toast'

import type { MediaResponse } from '~/shared/types'
import { formatFileSize, formatDateTime, isImageMedia, isVideoMedia } from '~/shared/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/core/components/shadcn/dialog'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import { Separator } from '~/core/components/shadcn/separator'

interface MediaPreviewModalProps {
  media: MediaResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MediaPreviewModal({ media, open, onOpenChange }: MediaPreviewModalProps) {
  const [copied, setCopied] = useState<boolean>(false)

  if (!media) return null

  const isImg = isImageMedia(media)
  const isVid = isVideoMedia(media)

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(media.url)
    setCopied(true)
    showToast('success', 'toasts.urlCopied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[720px] max-h-[90vh] overflow-y-auto p-0 gap-0'>
        {/* Header */}
        <div className='p-5 pb-4 bg-gray-50/80 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center justify-between gap-4 pr-6'>
              <span className='truncate' title={media.name}>
                {media.name}
              </span>
              <div className='flex items-center gap-2 shrink-0'>
                <Badge variant={media.active ? 'default' : 'secondary'} className='text-xs'>
                  {media.active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant='outline' className='text-xs font-mono'>
                  {media.type} {media.fileType ? `(${media.fileType.toUpperCase()})` : ''}
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription className='text-xs font-mono text-muted-foreground'>
              ID: {media.id}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Media Visual Preview Canvas */}
        <div className='bg-zinc-950 p-6 flex items-center justify-center min-h-[260px] max-h-[420px] overflow-hidden relative group'>
          {isImg ? (
            <img
              src={media.url}
              alt={media.altText || media.name}
              className='max-h-[380px] w-auto object-contain rounded shadow-lg'
            />
          ) : isVid ? (
            <video
              src={media.url}
              controls
              autoPlay={false}
              className='max-h-[380px] w-full rounded shadow-lg'
            />
          ) : (
            <div className='flex flex-col items-center justify-center text-zinc-400 space-y-3 py-8'>
              <File className='size-16 text-zinc-500' />
              <p className='text-sm font-medium text-zinc-300'>Preview not available for this file type</p>
              <Button variant='outline' size='sm' asChild className='bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'>
                <a href={media.url} target='_blank' rel='noreferrer'>
                  <ExternalLink className='size-4 mr-2' /> Open File URL
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Breakdown of Media Specifications & Metadata */}
        <div className='p-6 space-y-5 bg-white dark:bg-zinc-900'>
          <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Media Specifications & Metadata
          </h4>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
            {/* Field: ID */}
            <div className='space-y-1 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100 dark:border-zinc-800'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                <Hash className='size-3.5 text-primary' /> Media ID
              </div>
              <p className='font-mono text-xs font-semibold text-gray-900 dark:text-gray-100 select-all truncate' title={media.id}>
                {media.id}
              </p>
            </div>

            {/* Field: Name */}
            <div className='space-y-1 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100 dark:border-zinc-800'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                <FileImage className='size-3.5 text-blue-500' /> File Name
              </div>
              <p className='font-semibold text-gray-900 dark:text-gray-100 truncate' title={media.name}>
                {media.name}
              </p>
            </div>

            {/* Field: Alt Text */}
            <div className='space-y-1 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100 dark:border-zinc-800'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                <Type className='size-3.5 text-indigo-500' /> Alt Text (SEO)
              </div>
              <p className='text-xs text-gray-900 dark:text-gray-100 truncate' title={media.altText || 'Not specified'}>
                {media.altText || <span className='text-muted-foreground italic'>None</span>}
              </p>
            </div>

            {/* Field: Size */}
            <div className='space-y-1 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100 dark:border-zinc-800'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                <HardDrive className='size-3.5 text-emerald-500' /> File Size
              </div>
              <p className='font-mono text-xs font-semibold text-gray-900 dark:text-gray-100'>
                {formatFileSize(media.size)} <span className='text-[11px] font-normal text-muted-foreground'>({media.size.toLocaleString()} B)</span>
              </p>
            </div>

            {/* Field: Media Type & Format */}
            <div className='space-y-1 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100 dark:border-zinc-800'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                <Sparkles className='size-3.5 text-purple-500' /> Format & Type
              </div>
              <p className='font-mono text-xs font-semibold text-gray-900 dark:text-gray-100'>
                {media.type} • {media.fileType?.toUpperCase() || '-'}
              </p>
            </div>

            {/* Field: Duration (if video) or Status */}
            {media.duration ? (
              <div className='space-y-1 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100 dark:border-zinc-800'>
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                  <Clock className='size-3.5 text-amber-500' /> Video Duration
                </div>
                <p className='font-mono text-xs font-semibold text-gray-900 dark:text-gray-100'>
                  {media.duration}s
                </p>
              </div>
            ) : (
              <div className='space-y-1 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100 dark:border-zinc-800'>
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                  <Calendar className='size-3.5 text-amber-500' /> Created At
                </div>
                <p className='font-mono text-xs text-gray-900 dark:text-gray-100'>
                  {formatDateTime(media.created_at)}
                </p>
              </div>
            )}
          </div>

          {/* Full URL Bar & Actions */}
          <div className='space-y-2 pt-2'>
            <div className='flex items-center justify-between text-xs text-muted-foreground font-medium'>
              <span>Full Resource URL</span>
              <button onClick={handleCopyUrl} className='text-primary hover:underline flex items-center gap-1 cursor-pointer'>
                {copied ? <Check className='size-3 text-emerald-500' /> : <Copy className='size-3' />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <div className='p-2.5 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 font-mono text-xs text-gray-800 dark:text-zinc-200 break-all select-all'>
              {media.url}
            </div>
          </div>

          <Separator />

          {/* Footer Action Buttons */}
          <div className='flex items-center justify-end gap-2 pt-1'>
            <Button variant='outline' size='sm' onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant='secondary' size='sm' onClick={handleCopyUrl} className='gap-1.5'>
              {copied ? <Check className='size-4 text-emerald-500' /> : <Copy className='size-4' />}
              Copy URL
            </Button>
            <Button size='sm' asChild className='gap-1.5'>
              <a href={media.url} target='_blank' rel='noreferrer'>
                <ExternalLink className='size-4' /> Open Asset
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

