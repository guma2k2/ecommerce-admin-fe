import { useState } from 'react'
import { useLoaderData, useSearchParams, useNavigation, useNavigate, Link } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { Plus, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  getProductAttributeTemplates,
  deleteProductAttributeTemplate
} from '~/shared/services/api/productAttributeTemplateService'
import type {
  ProductAttributeTemplateItem,
  SortDirection,
  ProductAttributeTemplateSortField
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'
import ProductAttributeTemplateSearch from '~/features/authenticate/manageProductAttributeTemplate/components/ProductAttributeTemplateSearch'
import ProductAttributeTemplateTable from '~/features/authenticate/manageProductAttributeTemplate/components/ProductAttributeTemplateTable'
import ProductAttributeTemplatePagination from '~/features/authenticate/manageProductAttributeTemplate/components/ProductAttributeTemplatePagination'
import ProductAttributeTemplateDeleteDialog from '~/features/authenticate/manageProductAttributeTemplate/components/ProductAttributeTemplateDeleteDialog'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const pageNumber = Number(url.searchParams.get('pageNumber') || url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || ''
  const sortField = (url.searchParams.get('sortField') || url.searchParams.get('sort') || 'name') as ProductAttributeTemplateSortField
  const sortDir = (url.searchParams.get('sortDir') || url.searchParams.get('order') || 'asc') as SortDirection

  const response = await getProductAttributeTemplates({ pageNumber, pageSize, search, sortField, sortDir })

  return {
    ...response,
    searchParams: { pageNumber, pageSize, search, sortField, sortDir }
  }
}

clientLoader.hydrate = true as const

export default function ManageProductAttributeTemplatePage() {
  const { t } = useTranslation()
  const pageData = useLoaderData<typeof clientLoader>()
  const { content, pageNumber, pageSize, totalElements, totalPages, searchParams: currentParams } = pageData
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()

  // Modal Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<ProductAttributeTemplateItem | null>(null)

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

  const handleSort = (field: ProductAttributeTemplateSortField) => {
    const isCurrentField = currentParams.sortField === field
    const newDir: SortDirection = isCurrentField && currentParams.sortDir === 'asc' ? 'desc' : 'asc'
    updateQueryParams({ sortField: field, sortDir: newDir })
  }

  const handleEditClick = (template: ProductAttributeTemplateItem) => {
    navigate(`/admin/manage-product-attribute-template/edit/${template.id}`)
  }

  const handleOpenDeleteModal = (template: ProductAttributeTemplateItem) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return
    await deleteProductAttributeTemplate(templateToDelete.id)
    showToast('success', 'toasts.attributeTemplateDeleted')
    updateQueryParams({ _t: String(Date.now()) })
  }

  const handleRefresh = () => {
    updateQueryParams({ _t: String(Date.now()) })
    showToast('info', 'toasts.attributeTemplateRefreshed')
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
              {t('productAttributeTemplate.title')}
            </h1>
            <Badge variant='secondary' className='ml-1 font-semibold'>
              {t('productAttributeTemplate.totalCount', { count: totalElements })}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>
            {t('productAttributeTemplate.subtitle')}
          </p>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button
            variant='outline'
            size='icon'
            onClick={handleRefresh}
            title={t('productAttributeTemplate.refresh')}
            disabled={isLoading}
            className='bg-white dark:bg-zinc-900 shadow-xs'
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className='sr-only'>{t('productAttributeTemplate.refresh')}</span>
          </Button>

          <Button asChild className='shadow-xs gap-1.5'>
            <Link to='/admin/manage-product-attribute-template/create'>
              <Plus className='size-4' />
              {t('productAttributeTemplate.addNew')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='space-y-4'>
        {/* Search & Action Bar */}
        <div className='flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs'>
          <ProductAttributeTemplateSearch
            value={currentParams.search}
            onChange={handleSearchChange}
            isLoading={isLoading}
          />
        </div>

        {/* Product Attribute Template Table */}
        <ProductAttributeTemplateTable
          templates={content}
          isLoading={isLoading}
          sortField={currentParams.sortField}
          sortOrder={currentParams.sortDir}
          onSort={handleSort}
          onEdit={handleEditClick}
          onDelete={handleOpenDeleteModal}
        />

        {/* Pagination */}
        <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs p-2'>
          <ProductAttributeTemplatePagination
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
      <ProductAttributeTemplateDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        templateToDelete={templateToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
