import { useState } from 'react'
import { useLoaderData, useSearchParams, useNavigation, useNavigate, Link } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { Plus, Tag, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  getProductAttributes,
  deleteProductAttribute
} from '~/shared/services/api/productAttributeService'
import type {
  ProductAttributeItem,
  SortDirection,
  ProductAttributeSortField
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'
import ProductAttributeSearch from '~/features/authenticate/manageProductAttribute/components/ProductAttributeSearch'
import ProductAttributeTable from '~/features/authenticate/manageProductAttribute/components/ProductAttributeTable'
import ProductAttributePagination from '~/features/authenticate/manageProductAttribute/components/ProductAttributePagination'
import ProductAttributeDeleteDialog from '~/features/authenticate/manageProductAttribute/components/ProductAttributeDeleteDialog'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const pageNumber = Number(url.searchParams.get('pageNumber') || url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || ''
  const sortField = (url.searchParams.get('sortField') || url.searchParams.get('sort') || 'name') as ProductAttributeSortField
  const sortDir = (url.searchParams.get('sortDir') || url.searchParams.get('order') || 'asc') as SortDirection

  const response = await getProductAttributes({ pageNumber, pageSize, search, sortField, sortDir })

  return {
    ...response,
    searchParams: { pageNumber, pageSize, search, sortField, sortDir }
  }
}

clientLoader.hydrate = true as const

export default function ManageProductAttributePage() {
  const { t } = useTranslation()
  const pageData = useLoaderData<typeof clientLoader>()
  const { content, pageNumber, pageSize, totalElements, totalPages, searchParams: currentParams } = pageData
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()

  // Modal Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [attributeToDelete, setAttributeToDelete] = useState<ProductAttributeItem | null>(null)

  const isLoading = navigation.state === 'loading' || navigation.state === 'submitting'

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

  const handlePageChange = (newPageNumber: number) => {
    updateQueryParams({ pageNumber: String(newPageNumber) })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    updateQueryParams({ pageSize: String(newPageSize), pageNumber: '1' })
  }

  const handleSort = (field: ProductAttributeSortField) => {
    const isCurrentField = currentParams.sortField === field
    const newDir: SortDirection = isCurrentField && currentParams.sortDir === 'asc' ? 'desc' : 'asc'
    updateQueryParams({ sortField: field, sortDir: newDir })
  }

  const handleEditClick = (attribute: ProductAttributeItem) => {
    navigate(`/admin/manage-product-attribute/edit/${attribute.id}`)
  }

  const handleOpenDeleteModal = (attribute: ProductAttributeItem) => {
    setAttributeToDelete(attribute)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!attributeToDelete) return
    await deleteProductAttribute(attributeToDelete.id)
    showToast('success', 'toasts.attributeDeleted')
    updateQueryParams({ _t: String(Date.now()) })
  }

  const handleRefresh = () => {
    updateQueryParams({ _t: String(Date.now()) })
    showToast('info', 'toasts.attributeRefreshed')
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Header section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <div className='w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center'>
              <Tag className='size-5' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50'>
              {t('productAttribute.title')}
            </h1>
            <Badge variant='secondary' className='ml-1 font-semibold'>
              {t('productAttribute.totalCount', { count: totalElements })}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>
            {t('productAttribute.subtitle')}
          </p>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button
            variant='outline'
            size='icon'
            onClick={handleRefresh}
            title={t('productAttribute.refresh')}
            disabled={isLoading}
            className='bg-white dark:bg-zinc-900 shadow-xs'
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className='sr-only'>{t('productAttribute.refresh')}</span>
          </Button>

          <Button asChild className='shadow-xs gap-1.5'>
            <Link to='/admin/manage-product-attribute/create'>
              <Plus className='size-4' />
              {t('productAttribute.addNew')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='space-y-4'>
        {/* Search & Action Bar */}
        <div className='flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs'>
          <ProductAttributeSearch
            value={currentParams.search}
            onChange={handleSearchChange}
            isLoading={isLoading}
          />
        </div>

        {/* Product Attribute Table */}
        <ProductAttributeTable
          attributes={content}
          isLoading={isLoading}
          sortField={currentParams.sortField}
          sortOrder={currentParams.sortDir}
          onSort={handleSort}
          onEdit={handleEditClick}
          onDelete={handleOpenDeleteModal}
        />

        {/* Pagination */}
        <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs p-2'>
          <ProductAttributePagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ProductAttributeDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        attributeToDelete={attributeToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
