import { useState } from 'react'
import {
  Copy,
  Check,
  Eye,
  MoreHorizontal,
  ExternalLink,
  FileImage,
  Video,
  File
} from 'lucide-react'
import { showToast } from '~/shared/utils/toast'

import type { MediaResponse } from '~/shared/types'
import { formatFileSize, formatDateTime, isImageMedia, isVideoMedia } from '~/shared/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/core/components/shadcn/table'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/core/components/shadcn/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/core/components/shadcn/tooltip'
import { Skeleton } from '~/core/components/shadcn/skeleton'

interface MediaTableProps {
  mediaList: MediaResponse[]
  isLoading: boolean
  onPreview: (media: MediaResponse) => void
}

export default function MediaTable({ mediaList, isLoading, onPreview }: MediaTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    showToast('success', 'toasts.urlCopied')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const renderMediaTypeBadge = (item: MediaResponse) => {
    const isImg = isImageMedia(item)
    const isVid = isVideoMedia(item)

    if (isVid) {
      return (
        <Badge variant='outline' className='gap-1 text-[11px] font-mono border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40'>
          <Video className='size-3' />
          VIDEO {item.fileType ? `(${item.fileType.toUpperCase()})` : ''}
        </Badge>
      )
    }

    if (isImg) {
      return (
        <Badge variant='outline' className='gap-1 text-[11px] font-mono border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40'>
          <FileImage className='size-3' />
          IMAGE {item.fileType ? `(${item.fileType.toUpperCase()})` : ''}
        </Badge>
      )
    }

    return (
      <Badge variant='outline' className='gap-1 text-[11px] font-mono'>
        <File className='size-3 text-gray-500' />
        {item.type || item.fileType || 'MEDIA'}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className='w-full border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Name & Alt Text</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className='h-10 w-10 rounded' /></TableCell>
                <TableCell><Skeleton className='h-5 w-40' /></TableCell>
                <TableCell><Skeleton className='h-5 w-20' /></TableCell>
                <TableCell><Skeleton className='h-5 w-16' /></TableCell>
                <TableCell><Skeleton className='h-5 w-16' /></TableCell>
                <TableCell><Skeleton className='h-5 w-32' /></TableCell>
                <TableCell><Skeleton className='h-5 w-24' /></TableCell>
                <TableCell className='text-right'><Skeleton className='h-8 w-8 ml-auto rounded-full' /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    <div className='w-full border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs'>
      <Table>
        <TableHeader className='bg-gray-50/80 dark:bg-zinc-800/50'>
          <TableRow>
            <TableHead className='w-[70px]'>Preview</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200 min-w-[200px]'>Name / Alt Text</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200'>Type</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200'>Size</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200'>Status</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200 min-w-[180px]'>URL</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200'>Created</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200 text-right pr-6'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mediaList.map((item) => {
            const isImg = isImageMedia(item)
            const isVid = isVideoMedia(item)

            return (
              <TableRow key={item.id} className='hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors'>
                {/* Thumbnail Preview */}
                <TableCell>
                  <div
                    onClick={() => onPreview(item)}
                    className='relative group size-10 rounded border border-gray-200 dark:border-zinc-700 overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0 cursor-pointer flex items-center justify-center'
                  >
                    {isImg ? (
                      <img src={item.url} alt={item.altText || item.name} className='size-full object-cover group-hover:scale-110 transition-transform duration-200' />
                    ) : isVid ? (
                      <Video className='size-5 text-purple-500' />
                    ) : (
                      <File className='size-5 text-gray-500' />
                    )}
                    <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
                      <Eye className='size-4 text-white' />
                    </div>
                  </div>
                </TableCell>

                {/* Name & Alt Text */}
                <TableCell className='max-w-[240px] truncate'>
                  <div className='flex flex-col min-w-0'>
                    <span className='font-medium text-gray-900 dark:text-gray-100 truncate text-sm' title={item.name}>
                      {item.name}
                    </span>
                    {item.altText && (
                      <span className='text-xs text-muted-foreground truncate' title={item.altText}>
                        Alt: {item.altText}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Media Type */}
                <TableCell className='whitespace-nowrap'>
                  {renderMediaTypeBadge(item)}
                </TableCell>

                {/* Size */}
                <TableCell className='text-xs text-gray-600 dark:text-zinc-400 font-mono whitespace-nowrap'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className='cursor-help border-b border-dotted border-gray-400'>
                          {formatFileSize(item.size)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='text-xs'>{item.size.toLocaleString()} bytes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

                {/* Active Status */}
                <TableCell className='whitespace-nowrap'>
                  <Badge variant={item.active ? 'default' : 'secondary'} className='text-[10px] uppercase font-semibold'>
                    {item.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                {/* URL + Copy */}
                <TableCell>
                  <div className='flex items-center gap-1 min-w-0 max-w-[180px]'>
                    <a
                      href={item.url}
                      target='_blank'
                      rel='noreferrer'
                      className='text-xs text-primary hover:underline truncate flex items-center gap-1 font-mono'
                      title={item.url}
                    >
                      {item.url.replace(/^https?:\/\//, '').slice(0, 20)}...
                      <ExternalLink className='size-3 shrink-0' />
                    </a>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='size-7 shrink-0 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                            onClick={() => handleCopyUrl(item.url, item.id)}
                          >
                            {copiedId === item.id ? <Check className='size-3.5 text-emerald-500' /> : <Copy className='size-3.5' />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='text-xs'>Copy Media URL</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>

                {/* Created At */}
                <TableCell className='text-xs text-gray-600 dark:text-zinc-400 whitespace-nowrap font-mono'>
                  {formatDateTime(item.created_at)}
                </TableCell>

                {/* Actions */}
                <TableCell className='text-right pr-4 whitespace-nowrap'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='size-8 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'>
                        <MoreHorizontal className='size-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-40'>
                      <DropdownMenuItem onClick={() => onPreview(item)} className='cursor-pointer gap-2'>
                        <Eye className='size-4 text-blue-500' />
                        Preview Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyUrl(item.url, item.id)} className='cursor-pointer gap-2'>
                        <Copy className='size-4 text-emerald-500' />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className='cursor-pointer gap-2'>
                        <a href={item.url} target='_blank' rel='noreferrer'>
                          <ExternalLink className='size-4 text-purple-500' />
                          Open File
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

