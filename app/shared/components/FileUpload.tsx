import { ImagePlus } from "lucide-react"
import { Fragment, useRef, useState } from "react"
import { Input } from "~/core/components/shadcn/input"
import { Spinner } from "~/core/components/shadcn/spinner"
import type { UploadType } from "~/shared/types/Upload"
import { cn } from "~/shared/utils/appUtils"
type FileUploadProps = {
  onChange?: (url: string) => void
  isMultiple?: boolean
  acceptFile?: string
  validFileTypes?: string[]
}
export default function FileUpload({
  onChange,
  isMultiple = false,
  acceptFile = ".png, .jpg",
  validFileTypes = []
}: FileUploadProps) {
  const filePickerRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<UploadType[]>([
    {
      file: null,
      id: "",
      progress: 0,
      status: "idle",
      url: ""
    }
  ])
  const handleOpenFilePicker = () => {
    filePickerRef.current?.click()
  }

  const handleBeforeUpload = (files: File[]): boolean => {
    if (validFileTypes.length === 0) return true
    for (const file of files) {
      if (!validFileTypes.includes(file.type)) {
        return false
      }
    }
    return true
  }

  const handleUploadFile = async (files: File[]) => {
    const newUploadFiles: UploadType[] = files.map((file) => ({
      file,
      progress: 0,
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      status: "uploading"
    }))

    try {
      setUploads(newUploadFiles)

      // onChange?.(newUploadData.url)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setUploads(newUploadFiles.map((upload) => ({ ...upload, status: "success" })))
    } catch (error) {
      setUploads(newUploadFiles.map((upload) => ({ ...upload, status: "error" })))
    }

    // // Reset input so the same file can be selected again
    if (filePickerRef.current) {
      filePickerRef.current.value = ""
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    if (!handleBeforeUpload(files)) return
    await handleUploadFile(files)
  }

  const handleDropFiles = async (event: React.DragEvent) => {
    event.preventDefault()
    const droppedFiles = event?.dataTransfer.files
    if (!droppedFiles?.length) return
    const files = Array.from(droppedFiles)
    if (!handleBeforeUpload(files)) return
    await handleUploadFile(files)
  }

  return (
    <div
      className={cn(
        "group relative w-full h-full rounded-md border border-dashed border-gray-200 bg-white",
        "cursor-pointer aspect-square"
      )}
      onClick={handleOpenFilePicker}
      onDrop={handleDropFiles}
    >
      <Input
        multiple={isMultiple}
        type='file'
        className='hidden'
        accept={acceptFile}
        onChange={handleFileInputChange}
        ref={filePickerRef}
      />
      {isMultiple ? <MultipleFileUploadResult /> : <SingleFileUploadResult upload={uploads[0]} />}
    </div>
  )
}

function SingleFileUploadResult({ upload }: { upload: UploadType }) {
  return (
    <Fragment>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        {upload.status === "idle" && (
          <span className=''>
            <ImagePlus className='text-blue-500' size={14} />
          </span>
        )}
        {upload.status === "uploading" && <Spinner />}
        {upload.status === "error" && <span className='text-red-500'>Error</span>}
      </div>
      {upload.url && upload.status === "success" && (
        <img src={upload.url} alt='Image' className='w-full h-full object-cover rounded-md' />
      )}
    </Fragment>
  )
}

function MultipleFileUploadResult() {
  return <></>
}
