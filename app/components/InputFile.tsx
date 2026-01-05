import { ImagePlus, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { Input } from '~/components/ui/input'
import { cn } from '~/utils/appUtils'
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

type UploadType = {
  file: File | null
  progress: number
  status: UploadStatus
  url: string
  id: string
}
export default function InputFile() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [upload, setUpload] = useState<UploadType>({
    file: null,
    id: '',
    progress: 0,
    status: 'idle',
    url: ''
  })
  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }
  return (
    <div
      className={cn(
        'group relative w-full h-full rounded-md border border-dashed border-gray-200 bg-white',
        ' cursor-pointer aspect-square'
      )}
      onClick={handleClickUpload}
    >
      <Input
        multiple
        type='file'
        className='hidden'
        accept='.png, .jpg'
        // onChange={handleFileChange}
        ref={fileInputRef}
      />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        {upload.status === 'idle' && (
          <span className=''>
            <ImagePlus className='text-blue-500' size={14} />
          </span>
        )}
        {upload.status === 'uploading' && <span className='text-xs text-gray-500'>Uploading...</span>}
        {upload.status === 'error' && <span className='text-red-500'>Error</span>}
      </div>
      {upload.url && upload.status === 'success' && (
        <img src={upload.url} alt='Image' className='w-full h-full object-cover' />
      )}
    </div>
  )
}
