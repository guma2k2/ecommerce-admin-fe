export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export type UploadType = {
  file: File | null
  progress: number
  status: UploadStatus
  url: string
  id: string
  checked?: boolean
}
