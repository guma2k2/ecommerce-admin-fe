export interface MediaItem {
  id: string
  name: string
  url: string
  size: number // file size in bytes
  type: string // MIME type e.g., 'image/png', 'image/jpeg', 'video/mp4', 'application/pdf'
  created_at: string
  updated_at: string
}

export interface GetMediaParams {
  page?: number
  limit?: number
  search?: string
  type?: string
}

export interface GetMediaResponse {
  data: MediaItem[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}
