import { useState } from 'react'
import { useLoaderData, useSearchParams, useNavigation } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { Plus, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  getProductOptions
} from '~/shared/services/api/productOptionService'
import {
  useCreateProductOptionMutation,
  useUpdateProductOptionMutation,
  useDeleteProductOptionMutation
} from '~/shared/hooks/queries/useProductOptionQuery'
import type {
  ProductOptionResponse,
  SortDirection,
  ProductOptionSortField
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'
import {
  ProductOptionSearch,
  ProductOptionTable,
  ProductOptionPagination,
  ProductOptionModal,
  ProductOptionDeleteDialog,
  type ProductOptionFormSchema
} from '~/features/authenticate/manageProductOption'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const pageNumber = Number(url.searchParams.get('pageNumber') || url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || ''
  const sortField = (url.searchParams.get('sortField') || url.searchParams.get('sort') || 'name') as ProductOptionSortField
  const sortDir = (url.searchParams.get('sortDir') || url.searchParams.get('order') || 'asc') as SortDirection

  const response = await getProductOptions({ pageNumber, pageSize, search, sortField, sortDir })

  return {
    ...response,
    searchParams: { pageNumber, pageSize, search, sortField, sortDir }
  }
}

clientLoader.hydrate = true as const

export default function ManageProductOptionPage() {
  const { t } = useTranslation()
  const pageData = useLoaderData<typeof clientLoader>()
  const { content, pageNumber, pageSize, totalElements, totalPages, searchParams: currentParams } = pageData
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()

  // Modal Dialog States
  const [modalOpen, setModalOpen] = useState(false)
  const [optionToEdit, setOptionToEdit] = useState<ProductOptionResponse | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [optionToDelete, setOptionToDelete] = useState<ProductOptionResponse | null>(null)

  // Mutations
  const createMutation = useCreateProductOptionMutation()
  const updateMutation = useUpdateProductOptionMutation()
  const deleteMutation = useDeleteProductOptionMutation()

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

  const handleSort = (field: ProductOptionSortField) => {
    const isCurrentField = currentParams.sortField === field
    const newDir: SortDirection = isCurrentField && currentParams.sortDir === 'asc' ? 'desc' : 'asc'
    updateQueryParams({ sortField: field, sortDir: newDir })
  }

  const handleOpenCreateModal = () => {
    setOptionToEdit(null)
    setModalOpen(true)
  }

  const handleOpenEditModal = (option: ProductOptionResponse) => {
    setOptionToEdit(option)
    setModalOpen(true)
  }

  const handleOpenDeleteModal = (option: ProductOptionResponse) => {
    setOptionToDelete(option)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (values: ProductOptionFormSchema) => {
    if (optionToEdit) {
      await updateMutation.mutateAsync({
        id: optionToEdit.id,
        payload: { name: values.name }
      })
      showToast('success', 'toasts.updatedSuccess')
    } else {
      await createMutation.mutateAsync({
        name: values.name
      })
      showToast('success', 'toasts.createdSuccess')
    }
    updateQueryParams({ _t: String(Date.now()) })
  }

  const handleDeleteConfirm = async () => {
    if (!optionToDelete) return
    await deleteMutation.mutateAsync(optionToDelete.id)
    showToast('success', 'toasts.deletedSuccess')
    updateQueryParams({ _t: String(Date.now()) })
  }

  const handleRefresh = () => {
    updateQueryParams({ _t: String(Date.now()) })
    showToast('info', 'toasts.optionRefreshed')
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Header section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <div className='w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center'>
              <SlidersHorizontal className='size-5' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50'>
              {t('productOption.title')}
            </h1>
            <Badge variant='secondary' className='ml-1 font-semibold'>
              {t('productOption.totalCount', { count: totalElements })}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>
            {t('productOption.subtitle')}
          </p>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button
            variant='outline'
            size='icon'
            onClick={handleRefresh}
            title={t('productOption.refresh')}
            disabled={isLoading}
            className='bg-white dark:bg-zinc-900 shadow-xs'
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className='sr-only'>{t('productOption.refresh')}</span>
          </Button>

          <Button onClick={handleOpenCreateModal} className='shadow-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white'>
            <Plus className='size-4' />
            {t('productOption.addNew')}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='space-y-4'>
        {/* Search & Action Bar */}
        <div className='flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs'>
          <ProductOptionSearch
            value={currentParams.search}
            onChange={handleSearchChange}
            isLoading={isLoading}
          />
        </div>

        {/* Product Option Table */}
        <ProductOptionTable
          options={content}
          isLoading={isLoading}
          sortField={currentParams.sortField}
          sortOrder={currentParams.sortDir}
          onSort={handleSort}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />

        {/* Pagination */}
        <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs p-2'>
          <ProductOptionPagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Create / Edit Modal Dialog */}
      <ProductOptionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={optionToEdit}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <ProductOptionDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        optionToDelete={optionToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
