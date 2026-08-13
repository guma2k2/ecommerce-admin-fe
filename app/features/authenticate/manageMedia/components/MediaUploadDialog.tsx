import { useState, useRef, type DragEvent } from 'react'
import { Upload, X, File, Image as ImageIcon, Loader2 } from 'lucide-react'
import { showToast } from '~/shared/utils/toast'

import { createMediaItem, formatFileSize } from '~/shared/services/api/mediaService'
import type { MediaItem } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/core/components/shadcn/dialog'
import { Button } from '~/core/components/shadcn/button'
import { Input } from '~/core/components/shadcn/input'
import { Label } from '~/core/components/shadcn/label'

interface MediaUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newItem: MediaItem) => void
}

export default function MediaUploadDialog({ open, onOpenChange, onSuccess }: MediaUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [customName, setCustomName] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setSelectedFile(null)
    setCustomName('')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setIsUploading(false)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setCustomName(file.name)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('error', 'toasts.selectFileToUpload')
      return
    }

    try {
      setIsUploading(true)
      const newItem = await createMediaItem(selectedFile, customName.trim() || selectedFile.name)
      showToast('success', 'toasts.uploadSuccess')
      onSuccess(newItem)
      onOpenChange(false)
      resetForm()
    } catch (err) {
      console.error('Upload error:', err)
      showToast('error', 'toasts.uploadFailed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm()
        onOpenChange(val)
      }}
    >
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
            <Upload className='size-5 text-primary' />
            Upload New Media
          </DialogTitle>
          <DialogDescription>
            Select or drag and drop images, videos, or documents to upload to your media library.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Dropzone area */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                isDragging
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[0.99]'
                  : 'border-gray-300 dark:border-zinc-700 hover:border-primary hover:bg-gray-50/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className='p-4 bg-primary/10 text-primary rounded-full'>
                <Upload className='size-8' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                  Click to choose a file or drag & drop here
                </p>
                <p className='text-xs text-muted-foreground'>
                  Supports PNG, JPG, WEBP, SVG, MP4, PDF up to 50MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type='file'
                className='hidden'
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0])
                  }
                }}
              />
            </div>
          ) : (
            /* Selected file view */
            <div className='border border-gray-200 dark:border-zinc-800 rounded-xl p-4 bg-gray-50/50 dark:bg-zinc-900/50 space-y-4'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='size-14 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800 shrink-0 flex items-center justify-center'>
                    {previewUrl ? (
                      <img src={previewUrl} alt='Preview' className='size-full object-cover' />
                    ) : (
                      <File className='size-7 text-primary' />
                    )}
                  </div>
                  <div className='min-w-0 space-y-0.5'>
                    <p className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate' title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className='text-xs font-mono text-muted-foreground'>
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8 text-gray-500 hover:text-red-600'
                  onClick={() => setSelectedFile(null)}
                >
                  <X className='size-4' />
                </Button>
              </div>

              {/* Name field */}
              <div className='space-y-1.5'>
                <Label htmlFor='media-name' className='text-xs font-medium'>
                  Display Name
                </Label>
                <Input
                  id='media-name'
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder='Enter media display name'
                  className='h-9 bg-white dark:bg-zinc-800'
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className='gap-2'>
            {isUploading ? (
              <>
                <Loader2 className='size-4 animate-spin' /> Uploading...
              </>
            ) : (
              <>
                <Upload className='size-4' /> Confirm Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
