import axios from 'axios'
import { ImagePlus } from 'lucide-react'
import { useRef, useState } from 'react'
import { Input } from '~/components/ui/input'
import { Spinner } from '~/components/ui/spinner'
import type { UploadType } from '~/types/Upload'
import { cn } from '~/utils/appUtils'

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const file = e.target.files[0]
    const newUploadData: UploadType = {
      file,
      progress: 0,
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      status: 'idle'
    }

    try {
      setUpload({ ...newUploadData, status: 'uploading' })
      const formData = new FormData()
      formData.append('file', newUploadData.file as File)
      await axios.post('https://httpbin.org/post', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))

          setUpload((prev) => ({ ...prev, progress }))
        }
      })
      setUpload((prev) => ({ ...prev, status: 'success' }))
    } catch (error) {
      setUpload({ ...newUploadData, status: 'error' })
    }

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        {upload.status === 'idle' && (
          <span className=''>
            <ImagePlus className='text-blue-500' size={14} />
          </span>
        )}
        {upload.status === 'uploading' && <Spinner />}
        {upload.status === 'error' && <span className='text-red-500'>Error</span>}
      </div>
      {upload.url && upload.status === 'success' && (
        <img src={upload.url} alt='Image' className='w-full h-full object-cover rounded-md' />
      )}
    </div>
  )
}
