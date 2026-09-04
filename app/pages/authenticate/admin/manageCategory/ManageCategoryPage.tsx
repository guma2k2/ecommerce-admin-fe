import { useState } from 'react'
import { useLoaderData, useSearchParams, useNavigation, useNavigate, Link } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { Plus, FolderTree, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getCategories, deleteCategory } from '~/shared/services/api/categoryService'
import type { CategoryItem, SortDirection, SortField } from '~/shared/types'
import { showToast } from '~/shared/utils/toast'
import CategorySearch from '~/features/authenticate/manageCategory/components/CategorySearch'
import CategoryTable from '~/features/authenticate/manageCategory/components/CategoryTable'
import CategoryPagination from '~/features/authenticate/manageCategory/components/CategoryPagination'
import CategoryDeleteDialog from '~/features/authenticate/manageCategory/components/CategoryDeleteDialog'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const pageNumber = Number(url.searchParams.get('pageNumber') || url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || ''
  const sortField = (url.searchParams.get('sortField') || url.searchParams.get('sort') || 'name') as SortField
  const sortDir = (url.searchParams.get('sortDir') || url.searchParams.get('order') || 'asc') as SortDirection

  const response = await getCategories({ pageNumber, pageSize, search, sortField, sortDir })

  return {
    ...response,
    searchParams: { pageNumber, pageSize, search, sortField, sortDir }
  }
}

clientLoader.hydrate = true as const

export default function ManageCategoryPage() {
  const { t } = useTranslation()
  const pageData = useLoaderData<typeof clientLoader>()
  const { content, pageNumber, pageSize, totalElements, totalPages, searchParams: currentParams } = pageData
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null)

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

  const handleSort = (field: SortField) => {
    const isCurrentField = currentParams.sortField === field
    const newDir: SortDirection = isCurrentField && currentParams.sortDir === 'asc' ? 'desc' : 'asc'
    updateQueryParams({ sortField: field, sortDir: newDir })
  }

  const handleEditClick = (category: CategoryItem) => {
    navigate(`/admin/manage-category/edit/${category.id}`)
  }

  const handleOpenDeleteModal = (category: CategoryItem) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    try {
      await deleteCategory(categoryToDelete.id)
      updateQueryParams({ _t: String(Date.now()) })
    } catch (error: any) {
      console.error('Delete category error:', error)
      const errorMsg = error?.response?.data?.message || 'toasts.error'
      showToast('error', errorMsg)
    }
  }

  const handleRefresh = () => {
    updateQueryParams({ _t: String(Date.now()) })
    showToast('info', 'toasts.categoryRefreshed')
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Header section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <div className='w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center'>
              <FolderTree className='size-5' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50'>{t('category.title')}</h1>
            <Badge variant='secondary' className='ml-1 font-semibold'>
              {t('category.totalCount', { count: totalElements })}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>{t('category.subtitle')}</p>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button
            variant='outline'
            size='icon'
            onClick={handleRefresh}
            title={t('category.refresh')}
            disabled={isLoading}
            className='bg-white dark:bg-zinc-900 shadow-xs'
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className='sr-only'>{t('category.refresh')}</span>
          </Button>

          <Button asChild className='shadow-xs gap-1.5'>
            <Link to='/admin/manage-category/create'>
              <Plus className='size-4' />
              {t('category.addNew')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='space-y-4'>
        {/* Search & Action Bar */}
        <div className='flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs'>
          <CategorySearch value={currentParams.search} onChange={handleSearchChange} isLoading={isLoading} />
        </div>

        {/* Category Table */}
        <CategoryTable
          categories={content}
          isLoading={isLoading}
          sortField={currentParams.sortField}
          sortOrder={currentParams.sortDir}
          onSort={handleSort}
          onEdit={handleEditClick}
          onDelete={handleOpenDeleteModal}
        />

        {/* Pagination */}
        <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs p-2'>
          <CategoryPagination
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
      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoryToDelete={categoryToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
