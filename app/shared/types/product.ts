import type { PageResponse, SortDirection } from './pagination'
import type { ProductVariant } from './productVariant'

// ==========================================
// Product Thumbnail & Listing Types
// ==========================================

export interface ProductThumbnailResponse {
  id: number
  name: string
  slug: string
  thumbnailUrl: string | null
  price: number | null
}

export interface ProductItem {
  id: string | number
  name: string
  slug?: string
  image?: string
  thumbnailUrl?: string | null
  price?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface GetProductsParams {
  pageNumber?: number
  pageSize?: number
  name?: string
  categoryId?: number
  brandId?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductsResponse = PageResponse<ProductItem>

export type { ProductVariant }

// ==========================================
// Product API Request Types (from PRODUCT_API_INTEGRATION_GUIDE.md)
// ==========================================

// Media
export interface ProductMediaRequest {
  mediaId: string
  position: number
}

// Option & Option Values Requests
export interface ProductOptionValueCreateRequest {
  value: string
  position?: number
}

export interface ProductOptionValueUpdateRequest {
  id?: number | null
  value: string
  position?: number
}

export type ProductOptionValueRequest = ProductOptionValueUpdateRequest

export interface ProductOptionCombinationCreateRequest {
  productOptionId: number
  position?: number
  values?: ProductOptionValueCreateRequest[]
}

export interface ProductOptionCombinationUpdateRequest {
  productOptionId: number
  position?: number
  values?: ProductOptionValueUpdateRequest[]
}

export type ProductOptionCombinationRequest = ProductOptionCombinationUpdateRequest

// Attribute Requests
export interface ProductAttributeValueCreateRequest {
  productAttributeId: number
  value: string
}

export type ProductAttributeValueUpdateRequest = ProductAttributeValueCreateRequest
export type ProductAttributeValueRequest = ProductAttributeValueCreateRequest

// Variant Requests
export interface ProductVariantOptionValueCreateRequest {
  productOptionId: number
  value: string
}

export interface ProductVariantOptionValueUpdateRequest {
  productOptionValueId?: number | null
  productOptionId?: number | null
  value?: string | null
}

export interface ProductVariantAttributeValueCreateRequest {
  productAttributeId: number
  value: string
}

export type ProductVariantAttributeValueUpdateRequest = ProductVariantAttributeValueCreateRequest
export type ProductVariantAttributeValueRequest = ProductVariantAttributeValueCreateRequest

export interface ProductVariantCreateRequest {
  title?: string | null
  sku: string
  price: number
  quantity: number
  mediaId?: string | null
  optionValues?: ProductVariantOptionValueCreateRequest[] | null
  attributeValues?: ProductVariantAttributeValueCreateRequest[] | null
}

export interface ProductVariantUpdateRequest {
  id?: number | null
  title?: string | null
  sku: string
  price: number
  quantity: number
  mediaId?: string | null
  optionValues?: ProductVariantOptionValueUpdateRequest[] | null
  attributeValues?: ProductVariantAttributeValueUpdateRequest[] | null
}

export type ProductVariantRequest = ProductVariantUpdateRequest

// Top-Level Product Requests
export interface ProductCreateRequest {
  name: string
  slug: string
  description?: string | null
  metaTitle?: string | null
  metaKeyword?: string | null
  metaDescription?: string | null
  categoryId?: number | null
  brandId?: number | null
  medias?: ProductMediaRequest[] | null
  options?: ProductOptionCombinationCreateRequest[] | null
  attributes?: ProductAttributeValueCreateRequest[] | null
  variants: ProductVariantCreateRequest[]
}

export interface ProductUpdateRequest {
  name: string
  slug: string
  description?: string | null
  metaTitle?: string | null
  metaKeyword?: string | null
  metaDescription?: string | null
  categoryId?: number | null
  brandId?: number | null
  medias?: ProductMediaRequest[] | null
  options?: ProductOptionCombinationUpdateRequest[] | null
  attributes?: ProductAttributeValueUpdateRequest[] | null
  variants: ProductVariantUpdateRequest[]
}

// ==========================================
// Product API Response Types (from PRODUCT_API_INTEGRATION_GUIDE.md)
// ==========================================

export interface ProductMediaResponse {
  mediaId: string
  position: number
  url: string | null
  variantIds?: number[]
}

export interface ProductOptionValueResponse {
  id: number
  value: string
  position: number
}

export interface ProductOptionCombinationResponse {
  productOptionId: number
  name: string
  position: number
  values: ProductOptionValueResponse[]
}

export interface ProductAttributeValueResponse {
  id: number
  productAttributeId: number
  name: string
  value: string
}

export interface ProductVariantAttributeResponse {
  id?: number
  productAttributeId: number
  name: string
  value: string
}

export interface ProductVariantResponse {
  id: number
  title: string
  productOptionValueIds: number[]
  attributeValues: ProductVariantAttributeResponse[]
  attributes?: ProductVariantAttributeResponse[]
  sku: string
  price: number
  quantity: number
  mediaId: string | null
  mediaUrl: string | null
}

export interface ProductBrandResponse {
  id: number
  name: string
  description: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ProductCategoryResponse {
  id: number
  name: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ProductResponse {
  id: number
  name: string
  description: string | null
  slug: string
  metaTitle: string | null
  metaKeyword: string | null
  metaDescription: string | null
  brand: ProductBrandResponse | null
  category: ProductCategoryResponse | null
  medias: ProductMediaResponse[]
  attributes: ProductAttributeValueResponse[]
  options: ProductOptionCombinationResponse[]
  variants: ProductVariantResponse[]
  createdAt: string
  updatedAt: string
}
