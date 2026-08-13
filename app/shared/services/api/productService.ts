import type { PageResponse, SortDirection } from '~/shared/types/pagination'

export interface ProductItem {
  id: string
  name: string
  image: string
  created_at: string
  updated_at: string
}

export interface GetProductsParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductsResponse = PageResponse<ProductItem>

const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: "PROD-001",
    name: "Wireless Noise-Canceling Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-10T08:30:00Z",
    updated_at: "2025-01-15T10:20:00Z"
  },
  {
    id: "PROD-002",
    name: "Mechanical Gaming Keyboard RGB",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-11T09:15:00Z",
    updated_at: "2025-01-16T14:45:00Z"
  },
  {
    id: "PROD-003",
    name: "Ultra-Wide Curved Monitor 34-inch",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-12T11:00:00Z",
    updated_at: "2025-01-18T16:30:00Z"
  },
  {
    id: "PROD-004",
    name: "Ergonomic Wireless Mouse",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-14T07:45:00Z",
    updated_at: "2025-01-19T09:10:00Z"
  },
  {
    id: "PROD-005",
    name: "Smart Watch Series 9 GPS",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-15T13:20:00Z",
    updated_at: "2025-01-20T11:05:00Z"
  },
  {
    id: "PROD-006",
    name: "Portable Bluetooth Speaker Waterproof",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-16T15:10:00Z",
    updated_at: "2025-01-21T08:50:00Z"
  },
  {
    id: "PROD-007",
    name: "USB-C Multi-Port Hub Adapter",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-18T10:00:00Z",
    updated_at: "2025-01-22T17:15:00Z"
  },
  {
    id: "PROD-008",
    name: "4K Webcam with Dual Microphone",
    image: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-19T14:30:00Z",
    updated_at: "2025-01-23T13:40:00Z"
  },
  {
    id: "PROD-009",
    name: "High-Speed NVMe M.2 SSD 2TB",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-20T16:05:00Z",
    updated_at: "2025-01-25T12:00:00Z"
  },
  {
    id: "PROD-010",
    name: "Aluminum Laptop Stand Adjustable",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-22T12:40:00Z",
    updated_at: "2025-01-26T15:25:00Z"
  },
  {
    id: "PROD-011",
    name: "Wireless Charging Pad 15W",
    image: "https://images.unsplash.com/photo-1622445268465-843d63d0373a?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-24T09:50:00Z",
    updated_at: "2025-01-28T10:10:00Z"
  },
  {
    id: "PROD-012",
    name: "True Wireless Earbuds Pro",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-25T11:15:00Z",
    updated_at: "2025-01-29T14:00:00Z"
  },
  {
    id: "PROD-013",
    name: "Studio Condenser Microphone Kit",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-27T08:00:00Z",
    updated_at: "2025-01-30T16:45:00Z"
  },
  {
    id: "PROD-014",
    name: "Electric Standing Desk Frame",
    image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-28T14:20:00Z",
    updated_at: "2025-02-01T09:30:00Z"
  },
  {
    id: "PROD-015",
    name: "Gaming Chair Mesh Ergonomic",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-29T17:35:00Z",
    updated_at: "2025-02-02T11:50:00Z"
  },
  {
    id: "PROD-016",
    name: "Smart LED Desk Lamp Touch",
    image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-01-30T10:00:00Z",
    updated_at: "2025-02-03T14:15:00Z"
  },
  {
    id: "PROD-017",
    name: "Desk Mat Large XXL Leather",
    image: "https://images.unsplash.com/photo-1616440342855-585802cf0016?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-02-01T08:10:00Z",
    updated_at: "2025-02-04T10:00:00Z"
  },
  {
    id: "PROD-018",
    name: "External Hard Drive 4TB Rugged",
    image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-02-02T12:00:00Z",
    updated_at: "2025-02-05T15:30:00Z"
  },
  {
    id: "PROD-019",
    name: "Power Bank 20000mAh 65W Fast Charge",
    image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-02-03T09:30:00Z",
    updated_at: "2025-02-05T18:20:00Z"
  },
  {
    id: "PROD-020",
    name: "Smart Home Security Camera 1080p",
    image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=300&auto=format&fit=crop&q=80",
    created_at: "2025-02-04T15:00:00Z",
    updated_at: "2025-02-06T09:10:00Z"
  }
]

export async function getProducts(
  params: GetProductsParams = {}
): Promise<PageResponse<ProductItem>> {
  const { pageNumber = 1, pageSize = 10, search = "", sortField, sortDir = "asc" } = params

  await new Promise((resolve) => setTimeout(resolve, 300))

  const cleanSearch = search.trim().toLowerCase()
  
  let filteredProducts = cleanSearch
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanSearch) ||
          p.id.toLowerCase().includes(cleanSearch)
      )
    : [...MOCK_PRODUCTS]

  if (sortField) {
    filteredProducts.sort((a, b) => {
      const valA = (a as any)[sortField] || ""
      const valB = (b as any)[sortField] || ""
      const comp = String(valA).localeCompare(String(valB))
      return sortDir === "asc" ? comp : -comp
    })
  }

  const totalElements = filteredProducts.length
  const totalPages = Math.ceil(totalElements / pageSize) || 1
  const currentPage = Math.max(1, Math.min(pageNumber, totalPages))

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const content = filteredProducts.slice(startIndex, endIndex)

  return {
    content,
    pageNumber: currentPage,
    pageSize,
    totalElements,
    totalPages
  }
}
