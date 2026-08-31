import { useState, useRef, type DragEvent } from 'react'
import { Upload, X, File, Image as ImageIcon, Video, Loader2, Sparkles } from 'lucide-react'
import { useUploadMedia } from '~/shared/hooks/queries/useMediaQuery'
import { formatFileSize } from '~/shared/services/api/mediaService'
import type { MediaResponse } from '~/shared/types'
import { showToast } from '~/shared/utils/toast'
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
import { Progress } from '~/core/components/shadcn/progress'

interface MediaUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newItem: MediaResponse) => void
}

export default function MediaUploadDialog({ open, onOpenChange, onSuccess }: MediaUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [altText, setAltText] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isVideo, setIsVideo] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useUploadMedia({
    onSuccess: (newItem) => {
      onSuccess?.(newItem)
      onOpenChange(false)
      resetForm()
    }
  })

  const resetForm = () => {
    setSelectedFile(null)
    setAltText('')
    setUploadProgress(0)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setIsVideo(false)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setUploadProgress(0)
    
    // Auto-populate altText with clean file name if empty
    if (!altText) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setAltText(baseName)
    }

    if (file.type.startsWith('image/')) {
      setIsVideo(false)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else if (file.type.startsWith('video/')) {
      setIsVideo(true)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setIsVideo(false)
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

  const handleUpload = () => {
    if (!selectedFile) {
      showToast('error', 'toasts.selectFileToUpload')
      return
    }

    setUploadProgress(0)
    uploadMutation.mutate({
      file: selectedFile,
      altText: altText.trim() || undefined,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      }
    })
  }

  const isUploading = uploadMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm()
        onOpenChange(val)
      }}
    >
      <DialogContent className='sm:max-w-[540px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
            <Upload className='size-5 text-primary' />
            Upload New Media
          </DialogTitle>
          <DialogDescription>
            Upload images (PNG, JPG, WEBP, SVG) or videos (MP4, WEBM). File format is auto-detected.
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
                  Click to select file or drag & drop here
                </p>
                <p className='text-xs text-muted-foreground'>
                  Supports PNG, JPG, WEBP, SVG, MP4, MOV, WEBM
                </p>
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*,video/*'
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
                      isVideo ? (
                        <video src={previewUrl} className='size-full object-cover' />
                      ) : (
                        <img src={previewUrl} alt='Preview' className='size-full object-cover' />
                      )
                    ) : (
                      <File className='size-7 text-primary' />
                    )}
                  </div>
                  <div className='min-w-0 space-y-0.5'>
                    <p className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate' title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className='text-xs font-mono text-muted-foreground'>
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Auto-detect'}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8 text-gray-500 hover:text-red-600'
                    onClick={() => resetForm()}
                  >
                    <X className='size-4' />
                  </Button>
                )}
              </div>

              {/* Alt Text field for SEO and Accessibility */}
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='media-alt-text' className='text-xs font-medium'>
                    Alt Text / Description (Optional)
                  </Label>
                  <span className='text-[10px] text-muted-foreground'>Recommended for SEO</span>
                </div>
                <Input
                  id='media-alt-text'
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder='e.g. Summer sale promo banner'
                  disabled={isUploading}
                  className='h-9 bg-white dark:bg-zinc-800'
                />
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className='space-y-1.5 pt-1'>
                  <div className='flex justify-between text-xs font-medium'>
                    <span className='text-primary flex items-center gap-1.5'>
                      <Loader2 className='size-3.5 animate-spin' /> Uploading to server...
                    </span>
                    <span className='font-mono'>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className='h-2' />
                </div>
              )}
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

