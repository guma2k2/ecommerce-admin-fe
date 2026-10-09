import { httpRequest } from '~/shared/services/httpRequest'
import type {
  ApiResponse,
  CycleCountPayload,
  GetInventoriesParams,
  InventoryItem,
  PageResponse,
  StockAdjustmentPayload,
  StockMovementItem
} from '~/shared/types'

/**
 * Fetches paginated inventory list for administrative management.
 * Transforms 1-based UI page numbers to 0-based query params.
 */
export async function getInventories(
  params: GetInventoriesParams = {}
): Promise<PageResponse<InventoryItem>> {
  const uiPageNumber = params.pageNumber ?? 1
  const zeroBasedPage = Math.max(0, uiPageNumber - 1)
  const pageSize = params.pageSize ?? 10

  const response = await httpRequest.get<ApiResponse<PageResponse<InventoryItem>>>(
    '/inventories',
    {
      params: {
        pageNumber: zeroBasedPage,
        pageSize
      }
    }
  )

  const data = response.data.data
  let content = data.content || []

  // Client-side search filtering by SKU or product variant ID if requested
  if (params.search?.trim()) {
    const term = params.search.trim().toLowerCase()
    content = content.filter(
      (item) =>
        item.sku.toLowerCase().includes(term) ||
        String(item.productVariantId).includes(term)
    )
  }

  // Client-side sorting if specified
  if (params.sortField) {
    const field = params.sortField
    content = [...content].sort((a, b) => {
      const valA = a[field]
      const valB = b[field]
      if (typeof valA === 'number' && typeof valB === 'number') {
        return params.sortDir === 'desc' ? valB - valA : valA - valB
      }
      const strA = String(valA ?? '')
      const strB = String(valB ?? '')
      const comp = strA.localeCompare(strB)
      return params.sortDir === 'desc' ? -comp : comp
    })
  }

  return {
    ...data,
    content,
    pageNumber: uiPageNumber
  }
}

/**
 * Fetches inventory status for a specific product variant ID.
 */
export async function getInventoryByVariantId(variantId: number | string): Promise<InventoryItem> {
  const response = await httpRequest.get<ApiResponse<InventoryItem>>(`/inventories/${variantId}`)
  return response.data.data
}

/**
 * Performs an incremental stock adjustment (Restock, Return, Damaged, Theft/Loss, Promo).
 */
export async function adjustStock(payload: StockAdjustmentPayload): Promise<InventoryItem> {
  const response = await httpRequest.post<ApiResponse<InventoryItem>>(
    '/inventories/adjust',
    payload
  )
  return response.data.data
}

/**
 * Reconciles inventory during physical cycle count audits.
 */
export async function setCycleCount(payload: CycleCountPayload): Promise<InventoryItem> {
  const response = await httpRequest.post<ApiResponse<InventoryItem>>(
    '/inventories/set-count',
    payload
  )
  return response.data.data
}

/**
 * Fetches audit ledger movements for a specific product variant.
 */
export async function getStockMovements(
  variantId: number | string,
  pageNumber = 1,
  pageSize = 10
): Promise<PageResponse<StockMovementItem>> {
  const zeroBasedPage = Math.max(0, pageNumber - 1)
  const response = await httpRequest.get<ApiResponse<PageResponse<StockMovementItem>>>(
    `/inventories/movements/${variantId}`,
    {
      params: {
        pageNumber: zeroBasedPage,
        pageSize
      }
    }
  )

  const data = response.data.data
  return {
    ...data,
    pageNumber
  }
}

export const inventoryService = {
  getInventories,
  getInventoryByVariantId,
  adjustStock,
  setCycleCount,
  getStockMovements
}

export default inventoryService
