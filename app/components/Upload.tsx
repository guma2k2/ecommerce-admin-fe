import axios from 'axios'
import SortableImage from '~/features/authenticate/manageProduct/components/SortableImage'
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { Plus, TimerIcon, X } from 'lucide-react'
import React, { Fragment, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { cn } from '~/utils/appUtils'
type UploadProps = {
  onChange?: (value?: string) => void
  className?: string
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

type UploadType = {
  file: File | null
  progress: number
  status: UploadStatus
  url: string
  id: string
}
export default function Upload({ onChange }: UploadProps) {
  const [medias, setMedias] = useState<UploadType[]>([
    { progress: 0, status: 'idle', url: '', id: crypto.randomUUID(), file: null }
  ])
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getUrl = (file: File) => {
    return URL.createObjectURL(file)
  }

  const validFileTypes = ['image/jpeg', 'image/png', 'image/webp']
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const newFiles: UploadType[] = Array.from(e.target.files).map((file) => ({
      file,
      progress: 0,
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      status: 'idle'
    }))

    // Add new files to state
    setMedias((prev) => [...prev, ...newFiles])

    // Upload ONLY newly added files
    const uploadPromises = newFiles.map(async (item) => {
      const formData = new FormData()
      formData.append('file', item.file as File)

      try {
        setMedias((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f)))

        await axios.post('https://httpbin.org/post', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))

            setMedias((prev) => prev.map((f) => (f.id === item.id ? { ...f, progress } : f)))
          }
        })

        setMedias((prev) => prev.map((f) => (f.id === item.id ? { ...f, progress: 100, status: 'success' } : f)))
      } catch (error) {
        console.error(error)
        setMedias((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: 'error' } : f)))
      }
    })

    await Promise.all(uploadPromises)

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  // const resetFile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   e.stopPropagation()
  //   setUploadState({ file: null, progress: 0, status: 'idle' })
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = ''
  //   }
  // }

  const renderUploadComponent = (uploadType: UploadType) => {
    return (
      <div
        className={cn(
          'group relative w-full h-full rounded-md border border-dashed border-gray-500 bg-gray-100',
          'hover:bg-gray-200 cursor-pointer',
          medias.length > 1 && 'aspect-square'
        )}
        onClick={handleClickUpload}
      >
        <Input
          multiple
          type='file'
          className='hidden'
          accept='.png, .jpg'
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          {uploadType.status === 'idle' && (
            <span className=''>
              <Plus />
            </span>
          )}
          {uploadType.status === 'uploading' && <span className='text-xs text-gray-500'>Uploading...</span>}
          {uploadType.status === 'error' && <span className='text-red-500'>Error</span>}
        </div>
        {uploadType.url && uploadType.status === 'success' && (
          <>
            <SortableImage image={uploadType} />

            <div
              className={cn(
                'absolute inset-0 bg-black/40 transition-opacity duration-200 z-22',
                'opacity-0 ',
                'pointer-events-none',
                !isDragging && 'group-hover:opacity-100'
              )}
            >
              <div className='absolute top-2 right-2 pointer-events-auto'>
                <input type='checkbox' className='h-4 w-4 accent-white' onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = medias.findIndex((i) => i.id === active.id)
    const newIndex = medias.findIndex((i) => i.id === over.id)
    const newMedias = arrayMove(medias, oldIndex, newIndex)
    setMedias(newMedias)
    setIsDragging(false)
  }

  const normalizeMedias = (list: UploadType[]): UploadType[] => {
    const filtered = list.filter((m) => m.file !== null)
    const emptyFile = list.find((m) => m.file === null)
    if (filtered && emptyFile) {
      return [...filtered, emptyFile]
    }
    return []
  }

  const currentMedias = normalizeMedias(medias)
  return (
    <DndContext collisionDetection={closestCenter}>
      <SortableContext items={currentMedias.map((i) => i.id)} strategy={rectSortingStrategy}>
        {currentMedias.length > 0 && (
          <>
            {currentMedias.length == 1 && <div className='w-full h-30'>{renderUploadComponent(currentMedias[0])}</div>}
            {currentMedias.length > 1 && (
              <>
                <div className='grid grid-cols-12 gap-2'>
                  <div className='col-span-12 md:col-span-4 h-full'>{renderUploadComponent(currentMedias[0])}</div>
                  <div className='col-span-12 md:col-span-8 h-full'>
                    <div className='grid grid-cols-4 grid-rows-2 gap-2 h-full'>
                      {currentMedias.slice(1, 9).map((img) => (
                        <Fragment key={img.id}>{renderUploadComponent(img)}</Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-6 gap-2 mt-2'>
                  {currentMedias.slice(9).map((img) => (
                    <Fragment key={img.id}>{renderUploadComponent(img)}</Fragment>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </SortableContext>
    </DndContext>
  )
}
