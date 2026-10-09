import { useState, useMemo } from 'react'
import { useLoaderData, useSearchParams, useNavigation } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { Warehouse, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  getInventories,
  adjustStock,
  setCycleCount
} from '~/shared/services/api/inventoryService'
import type {
  InventoryItem,
  SortDirection,
  StockAdjustmentPayload,
  CycleCountPayload
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import Pagination from '~/shared/components/Pagination'

import {
  InventorySearchFilter,
  InventoryTable,
  StockAdjustModal,
  CycleCountModal,
  StockMovementsSheet,
  type StockFilterType
} from '~/features/authenticate/manageInventory'

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const pageNumber = Number(url.searchParams.get('pageNumber') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || '10')
  const search = url.searchParams.get('search') || ''
  const statusFilter = (url.searchParams.get('status') || 'ALL') as StockFilterType
  const sortField = (url.searchParams.get('sortField') || 'sku') as keyof InventoryItem
  const sortDir = (url.searchParams.get('sortDir') || 'asc') as SortDirection

  const response = await getInventories({
    pageNumber,
    pageSize,
    search,
    sortField,
    sortDir
  })

  return {
    ...response,
    searchParams: { pageNumber, pageSize, search, statusFilter, sortField, sortDir }
  }
}

clientLoader.hydrate = true as const

export default function ManageInventoryPage() {
  const { t } = useTranslation()
  const pageData = useLoaderData<typeof clientLoader>()
  const { content, pageNumber, pageSize, totalElements, totalPages, searchParams: currentParams } = pageData
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()

  // Modal & Sheet interaction states
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)

  const [selectedItemForCount, setSelectedItemForCount] = useState<InventoryItem | null>(null)
  const [countModalOpen, setCountModalOpen] = useState(false)

  const [selectedItemForMovements, setSelectedItemForMovements] = useState<InventoryItem | null>(null)
  const [movementsSheetOpen, setMovementsSheetOpen] = useState(false)

  const isLoading = navigation.state === 'loading' || navigation.state === 'submitting'

  // Filter content by status if requested
  const filteredContent = useMemo(() => {
    if (currentParams.statusFilter === 'IN_STOCK') {
      return content.filter((item) => item.available > 10)
    }
    if (currentParams.statusFilter === 'LOW_STOCK') {
      return content.filter((item) => item.available > 0 && item.available <= 10)
    }
    if (currentParams.statusFilter === 'OUT_OF_STOCK') {
      return content.filter((item) => item.available === 0)
    }
    return content
  }, [content, currentParams.statusFilter])

  const updateQueryParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      })
      return next
    })
  }

  const handleSearchChange = (newSearch: string) => {
    updateQueryParams({ search: newSearch, pageNumber: '1' })
  }

  const handleStatusFilterChange = (newStatus: StockFilterType) => {
    updateQueryParams({ status: newStatus === 'ALL' ? null : newStatus, pageNumber: '1' })
  }

  const handlePageChange = (newPageNumber: number) => {
    updateQueryParams({ pageNumber: String(newPageNumber) })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    updateQueryParams({ pageSize: String(newPageSize), pageNumber: '1' })
  }

  const handleSort = (field: keyof InventoryItem) => {
    const isCurrent = currentParams.sortField === field
    const newDir: SortDirection = isCurrent && currentParams.sortDir === 'asc' ? 'desc' : 'asc'
    updateQueryParams({ sortField: field, sortDir: newDir })
  }

  const handleRefresh = () => {
    updateQueryParams({ _t: String(Date.now()) })
    showToast('info', 'toasts.inventoryRefreshed')
  }

  // Trigger modal handlers
  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItemForAdjust(item)
    setAdjustModalOpen(true)
  }

  const handleOpenCount = (item: InventoryItem) => {
    setSelectedItemForCount(item)
    setCountModalOpen(true)
  }

  const handleOpenMovements = (item: InventoryItem) => {
    setSelectedItemForMovements(item)
    setMovementsSheetOpen(true)
  }

  // API Submission Handlers
  const handleAdjustSubmit = async (payload: StockAdjustmentPayload) => {
    try {
      await adjustStock(payload)
      showToast('success', 'toasts.stockAdjusted')
      updateQueryParams({ _t: String(Date.now()) })
    } catch (error: unknown) {
      console.error('Adjust stock error:', error)
      const err = error as { response?: { data?: { message?: string } } }
      showToast('error', err?.response?.data?.message || 'Failed to adjust stock')
    }
  }

  const handleCycleCountSubmit = async (payload: CycleCountPayload) => {
    try {
      await setCycleCount(payload)
      showToast('success', 'toasts.cycleCountUpdated')
      updateQueryParams({ _t: String(Date.now()) })
    } catch (error: unknown) {
      console.error('Set cycle count error:', error)
      const err = error as { response?: { data?: { message?: string } } }
      showToast('error', err?.response?.data?.message || 'Failed to update cycle count')
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2.5'>
            <div className='size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
              <Warehouse className='size-5' aria-hidden='true' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 text-balance'>
              {t('inventory.title')}
            </h1>
            <Badge variant='secondary' className='font-semibold text-xs'>
              {t('inventory.totalCount', { count: totalElements })}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>
            {t('inventory.subtitle')}
          </p>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button
            variant='outline'
            size='icon'
            onClick={handleRefresh}
            title={t('inventory.refresh')}
            disabled={isLoading}
            className='bg-white dark:bg-zinc-900 shadow-xs cursor-pointer'
            aria-label={t('inventory.refresh')}
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden='true' />
            <span className='sr-only'>{t('inventory.refresh')}</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area: Search Filter, Table, & Pagination */}
      <div className='space-y-4'>
        <InventorySearchFilter
          search={currentParams.search}
          onSearchChange={handleSearchChange}
          statusFilter={currentParams.statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          isLoading={isLoading}
        />

        <InventoryTable
          inventories={filteredContent}
          isLoading={isLoading}
          sortField={currentParams.sortField}
          sortDir={currentParams.sortDir}
          onSort={handleSort}
          onAdjustStock={handleOpenAdjust}
          onCycleCount={handleOpenCount}
          onViewMovements={handleOpenMovements}
        />

        <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs p-2'>
          <Pagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Stock Adjustment Dialog */}
      <StockAdjustModal
        open={adjustModalOpen}
        onOpenChange={setAdjustModalOpen}
        item={selectedItemForAdjust}
        onSubmit={handleAdjustSubmit}
      />

      {/* Cycle Count Reconciliation Dialog */}
      <CycleCountModal
        open={countModalOpen}
        onOpenChange={setCountModalOpen}
        item={selectedItemForCount}
        onSubmit={handleCycleCountSubmit}
      />

      {/* Movement Ledger Audit Drawer */}
      <StockMovementsSheet
        open={movementsSheetOpen}
        onOpenChange={setMovementsSheetOpen}
        item={selectedItemForMovements}
      />
    </div>
  )
}
