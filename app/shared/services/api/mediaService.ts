import type { GetMediaParams, GetMediaResponse, MediaItem } from '~/features/authenticate/manageMedia/types'

// Initial mock data with realistic items
let mockMediaDatabase: MediaItem[] = [
  {
    id: 'med_01H8X9A001',
    name: 'hero-banner-summer-sale.jpg',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    size: 1548576, // ~1.5 MB
    type: 'image/jpeg',
    created_at: '2026-08-01T10:15:30.000Z',
    updated_at: '2026-08-01T10:15:30.000Z'
  },
  {
    id: 'med_01H8X9A002',
    name: 'wireless-headphones-black.png',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    size: 842100, // ~822 KB
    type: 'image/png',
    created_at: '2026-08-02T14:22:10.000Z',
    updated_at: '2026-08-05T09:30:00.000Z'
  },
  {
    id: 'med_01H8X9A003',
    name: 'minimalist-smartwatch-titanium.webp',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    size: 412980, // ~403 KB
    type: 'image/webp',
    created_at: '2026-08-03T11:05:45.000Z',
    updated_at: '2026-08-03T11:05:45.000Z'
  },
  {
    id: 'med_01H8X9A004',
    name: 'product-demo-overview.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    size: 15830000, // ~15.1 MB
    type: 'video/mp4',
    created_at: '2026-08-04T16:40:00.000Z',
    updated_at: '2026-08-04T16:40:00.000Z'
  },
  {
    id: 'med_01H8X9A005',
    name: 'store-catalog-2026-q3.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: 2450000, // ~2.3 MB
    type: 'application/pdf',
    created_at: '2026-08-05T08:12:00.000Z',
    updated_at: '2026-08-06T13:45:20.000Z'
  },
  {
    id: 'med_01H8X9A006',
    name: 'nike-air-running-shoes.jpg',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    size: 1920400, // ~1.8 MB
    type: 'image/jpeg',
    created_at: '2026-08-06T09:10:15.000Z',
    updated_at: '2026-08-06T09:10:15.000Z'
  },
  {
    id: 'med_01H8X9A007',
    name: 'camera-lens-professional.jpg',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    size: 2150000, // ~2.0 MB
    type: 'image/jpeg',
    created_at: '2026-08-07T12:00:00.000Z',
    updated_at: '2026-08-07T12:00:00.000Z'
  },
  {
    id: 'med_01H8X9A008',
    name: 'brand-logo-vector.svg',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    size: 34500, // ~33 KB
    type: 'image/svg+xml',
    created_at: '2026-08-08T07:20:00.000Z',
    updated_at: '2026-08-08T07:20:00.000Z'
  }
]

export const getMediaList = async (params: GetMediaParams): Promise<GetMediaResponse> => {
  // Simulate minor network delay for realistic loader feel
  await new Promise((resolve) => setTimeout(resolve, 100))

  const { page = 1, limit = 10, search = '', type = 'all' } = params

  let filtered = [...mockMediaDatabase]

  if (search.trim()) {
    const searchLower = search.toLowerCase().trim()
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower) ||
        item.type.toLowerCase().includes(searchLower)
    )
  }

  if (type && type !== 'all') {
    if (type === 'image') {
      filtered = filtered.filter((item) => item.type.startsWith('image/'))
    } else if (type === 'video') {
      filtered = filtered.filter((item) => item.type.startsWith('video/'))
    } else if (type === 'document') {
      filtered = filtered.filter(
        (item) => item.type.includes('pdf') || item.type.includes('word') || item.type.includes('text')
      )
    }
  }

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / limit) || 1
  const startIndex = (page - 1) * limit
  const paginatedData = filtered.slice(startIndex, startIndex + limit)

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages
    }
  }
}

export const createMediaItem = async (file: File, customName?: string): Promise<MediaItem> => {
  const now = new Date().toISOString()
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  const id = `med_${Date.now().toString(36).toUpperCase()}${randomSuffix}`

  // Create preview URL for uploaded file
  const url = URL.createObjectURL(file)

  const newItem: MediaItem = {
    id,
    name: customName || file.name,
    url,
    size: file.size,
    type: file.type || 'application/octet-stream',
    created_at: now,
    updated_at: now
  }

  mockMediaDatabase = [newItem, ...mockMediaDatabase]
  return newItem
}

export const updateMediaItemName = async (id: string, newName: string): Promise<MediaItem> => {
  const index = mockMediaDatabase.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error('Media item not found')
  }

  const updatedItem: MediaItem = {
    ...mockMediaDatabase[index],
    name: newName,
    updated_at: new Date().toISOString()
  }

  mockMediaDatabase[index] = updatedItem
  return updatedItem
}

export const deleteMediaItem = async (id: string): Promise<boolean> => {
  const initialLength = mockMediaDatabase.length
  mockMediaDatabase = mockMediaDatabase.filter((item) => item.id !== id)
  return mockMediaDatabase.length < initialLength
}

// Utility formatters
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const formatDateTime = (isoString: string): string => {
  if (!isoString) return '-'
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return isoString
  }
}
