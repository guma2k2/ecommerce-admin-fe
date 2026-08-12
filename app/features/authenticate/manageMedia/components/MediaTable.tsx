import * as React from 'react'
import {
  Copy,
  Check,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  FileImage,
  Video,
  FileCode,
  File
} from 'lucide-react'
import { toast } from 'sonner'

import type { MediaItem } from '../types'
import { formatFileSize, formatDateTime } from '~/shared/services/api/mediaService'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/core/components/shadcn/table'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/core/components/shadcn/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/core/components/shadcn/tooltip'
import { Skeleton } from '~/core/components/shadcn/skeleton'

interface MediaTableProps {
  mediaList: MediaItem[]
  isLoading: boolean
  onPreview: (media: MediaItem) => void
  onEdit: (media: MediaItem) => void
  onDelete: (media: MediaItem) => void
}

export default function MediaTable({ mediaList, isLoading, onPreview, onEdit, onDelete }: MediaTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('Media URL copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const renderMediaTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className='size-4 text-blue-500' />
    if (type.startsWith('video/')) return <Video className='size-4 text-purple-500' />
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
      return <FileText className='size-4 text-emerald-500' />
    }
    if (type.includes('json') || type.includes('xml') || type.includes('javascript')) {
      return <FileCode className='size-4 text-amber-500' />
    }
    return <File className='size-4 text-gray-500' />
  }

  if (isLoading) {
    return (
      <div className='w-full border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Preview & URL</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className='h-5 w-40' /></TableCell>
                <TableCell><Skeleton className='h-10 w-28' /></TableCell>
                <TableCell><Skeleton className='h-5 w-16' /></TableCell>
                <TableCell><Skeleton className='h-5 w-20' /></TableCell>
                <TableCell><Skeleton className='h-5 w-28' /></TableCell>
                <TableCell><Skeleton className='h-5 w-28' /></TableCell>
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
          <p className='text-sm text-muted-foreground'>Try adjusting your search query or file filter, or upload a new file.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs'>
      <Table>
        <TableHeader className='bg-gray-50/80 dark:bg-zinc-800/50'>
          <TableRow>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200 min-w-[200px]'>Name</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200 min-w-[220px]'>URL</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200'>Size</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200'>Type</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200'>Created At</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200'>Updated At</TableHead>
            <TableHead className='font-semibold text-gray-700 dark:text-gray-200 text-right pr-6'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mediaList.map((item) => (
            <TableRow key={item.id} className='hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors'>
              {/* Field 1: Name (ID hidden) */}
              <TableCell className='font-medium text-gray-900 dark:text-gray-100 max-w-[240px] truncate'>
                <div className='flex items-center gap-2 truncate' title={item.name}>
                  {renderMediaTypeIcon(item.type)}
                  <span className='truncate'>{item.name}</span>
                </div>
              </TableCell>

              {/* Field 3: URL (Thumbnail + Link + Copy) */}
              <TableCell>
                <div className='flex items-center gap-2'>
                  <div
                    onClick={() => onPreview(item)}
                    className='relative group size-10 rounded border border-gray-200 dark:border-zinc-700 overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0 cursor-pointer flex items-center justify-center'
                  >
                    {item.type.startsWith('image/') ? (
                      <img src={item.url} alt={item.name} className='size-full object-cover group-hover:scale-110 transition-transform duration-200' />
                    ) : item.type.startsWith('video/') ? (
                      <Video className='size-5 text-purple-500' />
                    ) : (
                      <FileText className='size-5 text-gray-500' />
                    )}
                    <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
                      <Eye className='size-4 text-white' />
                    </div>
                  </div>

                  <div className='flex items-center gap-1 min-w-0 max-w-[160px]'>
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
                </div>
              </TableCell>

              {/* Field 4: Size */}
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

              {/* Field 5: Type */}
              <TableCell className='whitespace-nowrap'>
                <Badge
                  variant='outline'
                  className='text-[11px] font-mono font-normal bg-gray-50 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'
                >
                  {item.type}
                </Badge>
              </TableCell>

              {/* Field 6: Created At */}
              <TableCell className='text-xs text-gray-600 dark:text-zinc-400 whitespace-nowrap font-mono'>
                {formatDateTime(item.created_at)}
              </TableCell>

              {/* Field 7: Updated At */}
              <TableCell className='text-xs text-gray-600 dark:text-zinc-400 whitespace-nowrap font-mono'>
                {formatDateTime(item.updated_at)}
              </TableCell>

              {/* Actions */}
              <TableCell className='text-right pr-4 whitespace-nowrap'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='size-8 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'>
                      <MoreHorizontal className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-44'>
                    <DropdownMenuItem onClick={() => onPreview(item)} className='cursor-pointer gap-2'>
                      <Eye className='size-4 text-blue-500' />
                      Preview Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyUrl(item.url, item.id)} className='cursor-pointer gap-2'>
                      <Copy className='size-4 text-emerald-500' />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(item)} className='cursor-pointer gap-2'>
                      <Pencil className='size-4 text-amber-500' />
                      Edit Name
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(item)} className='cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40'>
                      <Trash2 className='size-4' />
                      Delete Media
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
