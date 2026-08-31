import * as React from 'react'
import { Copy, Eye, MoreHorizontal, Video, FileImage, File, ExternalLink } from 'lucide-react'
import { showToast } from '~/shared/utils/toast'

import type { MediaResponse } from '~/shared/types'
import { formatFileSize, formatDateTime, isImageMedia, isVideoMedia } from '~/shared/services/api/mediaService'
import { Badge } from '~/core/components/shadcn/badge'
import { Button } from '~/core/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/core/components/shadcn/dropdown-menu'
import { Skeleton } from '~/core/components/shadcn/skeleton'

interface MediaGridViewProps {
  mediaList: MediaResponse[]
  isLoading: boolean
  onPreview: (media: MediaResponse) => void
}

export default function MediaGridView({ mediaList, isLoading, onPreview }: MediaGridViewProps) {
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    showToast('success', 'toasts.urlCopied')
  }

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='border border-gray-200 dark:border-zinc-800 rounded-lg p-3 space-y-3 bg-white dark:bg-zinc-900'>
            <Skeleton className='h-40 w-full rounded-md' />
            <Skeleton className='h-5 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        ))}
      </div>
    )
  }

  if (mediaList.length === 0) {
    return (
      <div className='w-full border border-gray-200 dark:border-zinc-800 rounded-lg p-12 text-center bg-white dark:bg-zinc-900 flex flex-col items-center justify-center space-y-3'>
        <div className='p-4 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-400'>
          <FileImage className='size-8' />
        </div>
        <div className='space-y-1'>
          <p className='text-base font-semibold text-gray-900 dark:text-gray-100'>No media files found</p>
          <p className='text-sm text-muted-foreground'>Try adjusting your search query or upload a new image or video.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {mediaList.map((item) => {
        const isImg = isImageMedia(item)
        const isVid = isVideoMedia(item)

        return (
          <div
            key={item.id}
            className='group border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col'
          >
            {/* Card Media Preview Area */}
            <div
              onClick={() => onPreview(item)}
              className='relative h-44 w-full bg-gray-100 dark:bg-zinc-800 overflow-hidden cursor-pointer flex items-center justify-center border-b border-gray-100 dark:border-zinc-800/80'
            >
              {isImg ? (
                <img
                  src={item.url}
                  alt={item.altText || item.name}
                  className='size-full object-cover group-hover:scale-105 transition-transform duration-300'
                />
              ) : isVid ? (
                <div className='flex flex-col items-center gap-2 text-purple-500'>
                  <Video className='size-12' />
                  <span className='text-xs font-medium'>Video {item.duration ? `(${item.duration}s)` : ''}</span>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2 text-gray-500'>
                  <File className='size-12' />
                  <span className='text-xs font-medium'>Media File</span>
                </div>
              )}

              {/* Hover Action Overlay */}
              <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                <Button size='sm' variant='secondary' className='h-8 shadow-sm gap-1' onClick={(e) => { e.stopPropagation(); onPreview(item) }}>
                  <Eye className='size-3.5' /> Preview
                </Button>
                <Button size='sm' variant='secondary' className='h-8 shadow-sm gap-1' onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url) }}>
                  <Copy className='size-3.5' /> Copy
                </Button>
              </div>

              {/* Top Badges */}
              <div className='absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none'>
                <Badge variant='secondary' className='text-[10px] font-mono bg-black/60 backdrop-blur-md text-white border-0'>
                  {item.fileType?.toUpperCase() || item.type}
                </Badge>
                <Badge variant='secondary' className='text-[10px] font-mono bg-black/60 backdrop-blur-md text-white border-0'>
                  {formatFileSize(item.size)}
                </Badge>
              </div>
            </div>

            {/* Card Body & Details */}
            <div className='p-3 flex-1 flex flex-col justify-between space-y-2'>
              <div className='space-y-1'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0 flex-1'>
                    <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate' title={item.name}>
                      {item.name}
                    </h3>
                    {item.altText && (
                      <p className='text-xs text-muted-foreground truncate' title={item.altText}>
                        Alt: {item.altText}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='size-7 shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'>
                        <MoreHorizontal className='size-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-40'>
                      <DropdownMenuItem onClick={() => onPreview(item)} className='cursor-pointer gap-2'>
                        <Eye className='size-4 text-blue-500' />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyUrl(item.url)} className='cursor-pointer gap-2'>
                        <Copy className='size-4 text-emerald-500' />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className='cursor-pointer gap-2'>
                        <a href={item.url} target='_blank' rel='noreferrer'>
                          <ExternalLink className='size-4 text-purple-500' />
                          Open File
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* ID Badge */}
                <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono pt-1'>
                  <span>ID:</span>
                  <span className='px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 truncate max-w-[170px]' title={item.id}>
                    {item.id}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className='pt-2 border-t border-gray-100 dark:border-zinc-800/80 text-[10px] text-gray-500 flex flex-col gap-0.5 font-mono'>
                <div className='flex justify-between'>
                  <span>Type:</span>
                  <span className='font-semibold'>{item.type}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Created:</span>
                  <span>{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

