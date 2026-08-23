import type {
  ProductItem,
  GetProductsParams,
  PaginatedProductsResponse,
  PageResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductResponse
} from '~/shared/types'

export type { ProductItem, GetProductsParams, PaginatedProductsResponse }

let MOCK_PRODUCTS: ProductItem[] = [
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
  }
]

// Detailed product records for edit mode / detail view
let MOCK_PRODUCT_DETAILS: Record<string, ProductResponse> = {
  "PROD-001": {
    id: 1,
    name: "Wireless Noise-Canceling Headphones",
    slug: "wireless-noise-canceling-headphones",
    description: "<p>Experience premium acoustic performance with high-grade active noise cancellation.</p>",
    metaTitle: "Buy Wireless Noise-Canceling Headphones",
    metaKeyword: "headphones, noise-canceling, bluetooth, audio",
    metaDescription: "Enjoy studio-quality audio with all-day battery life and seamless ANC.",
    brand: {
      id: 3,
      name: "Sony",
      description: "Audio & Entertainment"
    },
    medias: [
      {
        mediaId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        position: 0,
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        variantIds: [101]
      }
    ],
    attributes: [
      {
        productAttributeId: 3,
        name: "Material",
        value: "Synthetic Leather & Aluminum"
      },
      {
        productAttributeId: 8,
        name: "Battery Capacity",
        value: "40 Hours ANC on"
      }
    ],
    options: [
      {
        productOptionId: 1,
        name: "Color",
        position: 0,
        values: [
          { id: 110, value: "Midnight Black", position: 0 },
          { id: 111, value: "Platinum Silver", position: 1 }
        ]
      }
    ],
    variants: [
      {
        id: 101,
        title: "Midnight Black",
        productOptionValueIds: [110],
        sku: "SONY-WH-BLK-01",
        price: 299.99,
        quantity: 45
      },
      {
        id: 102,
        title: "Platinum Silver",
        productOptionValueIds: [111],
        sku: "SONY-WH-SLV-02",
        price: 319.99,
        quantity: 20
      }
    ],
    createdAt: "2025-01-10T08:30:00Z",
    updatedAt: "2025-01-15T10:20:00Z"
  }
}

export async function getProducts(
  params: GetProductsParams = {}
): Promise<PageResponse<ProductItem>> {
  const { pageNumber = 1, pageSize = 10, search = "", sortField, sortDir = "asc" } = params

  await new Promise((resolve) => setTimeout(resolve, 200))

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

export async function getProductById(id: string | number): Promise<ProductResponse> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const key = String(id)
  
  // Return mock detail if available
  if (MOCK_PRODUCT_DETAILS[key]) {
    return MOCK_PRODUCT_DETAILS[key]
  }

  // Generate fallback detail if basic product exists
  const basic = MOCK_PRODUCTS.find((p) => p.id === key || p.id === `PROD-${key}`)
  const numId = typeof id === 'number' ? id : parseInt(key.replace(/\D/g, ''), 10) || 45

  return {
    id: numId,
    name: basic?.name || "Nike Air Max 270",
    slug: (basic?.name || "Nike Air Max 270").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: "<p>The Nike Air Max 270 delivers unmatched, all-day comfort.</p>",
    metaTitle: `Buy ${basic?.name || "Nike Air Max 270"} Online`,
    metaKeyword: "shoes, sportswear, footwear",
    metaDescription: `Discover the best deals on ${basic?.name || "Nike Air Max 270"}.`,
    brand: {
      id: 3,
      name: "Sony",
      description: "Audio & Entertainment"
    },
    medias: [
      {
        mediaId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        position: 0,
        url: basic?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        variantIds: []
      }
    ],
    attributes: [
      { productAttributeId: 101, name: "Material", value: "Mesh & Synthetic" },
      { productAttributeId: 102, name: "Origin", value: "Vietnam" }
    ],
    options: [
      {
        productOptionId: 1,
        name: "Color",
        position: 0,
        values: [
          { id: 110, value: "Black / White", position: 0 },
          { id: 111, value: "Triple Red", position: 1 }
        ]
      }
    ],
    variants: [
      {
        id: 88,
        title: "Black / White",
        productOptionValueIds: [110],
        sku: "NK-AM270-BW",
        price: 159.99,
        quantity: 50
      },
      {
        id: 89,
        title: "Triple Red",
        productOptionValueIds: [111],
        sku: "NK-AM270-RED",
        price: 169.99,
        quantity: 30
      }
    ],
    createdAt: basic?.created_at || new Date().toISOString(),
    updatedAt: basic?.updated_at || new Date().toISOString()
  }
}

export async function createProduct(payload: ProductCreateRequest): Promise<ProductResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  const newNumId = Math.floor(Math.random() * 900) + 100
  const stringId = `PROD-${String(newNumId).padStart(3, "0")}`
  const now = new Date().toISOString()
  const firstMediaUrl = payload.medias?.[0]?.mediaId 
    ? "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80"
    : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80"

  const newListItem: ProductItem = {
    id: stringId,
    name: payload.name,
    image: firstMediaUrl,
    created_at: now,
    updated_at: now
  }
  MOCK_PRODUCTS = [newListItem, ...MOCK_PRODUCTS]

  const createdResponse: ProductResponse = {
    id: newNumId,
    name: payload.name,
    slug: payload.slug,
    description: payload.description || null,
    metaTitle: payload.metaTitle || null,
    metaKeyword: payload.metaKeyword || null,
    metaDescription: payload.metaDescription || null,
    brand: payload.brandId ? { id: payload.brandId, name: "Selected Brand" } : null,
    medias: payload.medias?.map((m) => ({
      mediaId: m.mediaId,
      position: m.position,
      url: firstMediaUrl,
      variantIds: []
    })) || [],
    attributes: payload.attributes?.map((a) => ({
      productAttributeId: a.productAttributeId,
      name: "Attribute",
      value: a.value
    })) || [],
    options: payload.options?.map((o, idx) => ({
      productOptionId: o.productOptionId || idx + 1,
      name: o.name || `Option ${idx + 1}`,
      position: o.position,
      values: o.values.map((v, vIdx) => ({
        id: Math.floor(Math.random() * 1000) + 1,
        value: v.value,
        position: v.position || vIdx
      }))
    })) || [],
    variants: payload.variants.map((v, idx) => ({
      id: Math.floor(Math.random() * 1000) + 1,
      title: v.title || `Variant ${idx + 1}`,
      productOptionValueIds: [],
      sku: v.sku,
      price: v.price,
      quantity: v.quantity
    })),
    createdAt: now,
    updatedAt: now
  }

  MOCK_PRODUCT_DETAILS[stringId] = createdResponse
  MOCK_PRODUCT_DETAILS[String(newNumId)] = createdResponse

  return createdResponse
}

export async function updateProduct(
  id: string | number,
  payload: ProductUpdateRequest
): Promise<ProductResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const key = String(id)
  const numId = typeof id === 'number' ? id : parseInt(key.replace(/\D/g, ''), 10) || 1
  const now = new Date().toISOString()

  // Update in basic list
  const basicIndex = MOCK_PRODUCTS.findIndex((p) => p.id === key || p.id === `PROD-${key}`)
  if (basicIndex !== -1) {
    MOCK_PRODUCTS[basicIndex] = {
      ...MOCK_PRODUCTS[basicIndex],
      name: payload.name,
      updated_at: now
    }
  }

  const updatedResponse: ProductResponse = {
    id: numId,
    name: payload.name,
    slug: payload.slug,
    description: payload.description || null,
    metaTitle: payload.metaTitle || null,
    metaKeyword: payload.metaKeyword || null,
    metaDescription: payload.metaDescription || null,
    brand: payload.brandId ? { id: payload.brandId, name: "Brand" } : null,
    medias: payload.medias?.map((m) => ({
      mediaId: m.mediaId,
      position: m.position,
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      variantIds: []
    })) || [],
    attributes: payload.attributes?.map((a) => ({
      productAttributeId: a.productAttributeId,
      name: "Attribute",
      value: a.value
    })) || [],
    options: payload.options?.map((o, idx) => ({
      productOptionId: o.productOptionId || idx + 1,
      name: o.name || `Option ${idx + 1}`,
      position: o.position,
      values: o.values.map((v, vIdx) => ({
        id: v.id || Math.floor(Math.random() * 1000) + 1,
        value: v.value,
        position: v.position || vIdx
      }))
    })) || [],
    variants: payload.variants.map((v, idx) => ({
      id: v.id || Math.floor(Math.random() * 1000) + 1,
      title: v.title || `Variant ${idx + 1}`,
      productOptionValueIds: [],
      sku: v.sku,
      price: v.price,
      quantity: v.quantity
    })),
    createdAt: "2025-01-10T08:30:00Z",
    updatedAt: now
  }

  MOCK_PRODUCT_DETAILS[key] = updatedResponse
  MOCK_PRODUCT_DETAILS[String(numId)] = updatedResponse

  return updatedResponse
}

export async function deleteProduct(id: string | number): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const key = String(id)
  MOCK_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.id !== key && p.id !== `PROD-${key}`)
  delete MOCK_PRODUCT_DETAILS[key]
  return true
}
