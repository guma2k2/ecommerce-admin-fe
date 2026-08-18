import type { PageResponse, SortDirection } from './pagination'

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
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
  type?: string
}

export type GetMediaResponse = PageResponse<MediaItem>
export type MediaTypeFilter = 'all' | 'image' | 'video' | 'document'
