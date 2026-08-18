import { useState } from 'react'
import { useLoaderData, useSearchParams, useNavigation, useNavigate, Link } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { Plus, Award, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  getBrands,
  deleteBrand
} from '~/shared/services/api/brandService'
import type { BrandItem, SortDirection, BrandSortField } from '~/shared/types'
import { showToast } from '~/shared/utils/toast'
import BrandSearch from '~/features/authenticate/manageBrand/components/BrandSearch'
import BrandTable from '~/features/authenticate/manageBrand/components/BrandTable'
import BrandPagination from '~/features/authenticate/manageBrand/components/BrandPagination'
import BrandDeleteDialog from '~/features/authenticate/manageBrand/components/BrandDeleteDialog'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const pageNumber = Number(url.searchParams.get('pageNumber') || url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || ''
  const sortField = (url.searchParams.get('sortField') || url.searchParams.get('sort') || 'name') as BrandSortField
  const sortDir = (url.searchParams.get('sortDir') || url.searchParams.get('order') || 'asc') as SortDirection

  const response = await getBrands({ pageNumber, pageSize, search, sortField, sortDir })

  return {
    ...response,
    searchParams: { pageNumber, pageSize, search, sortField, sortDir }
  }
}

clientLoader.hydrate = true as const

export default function ManageBrandPage() {
  const { t } = useTranslation()
  const pageData = useLoaderData<typeof clientLoader>()
  const { content, pageNumber, pageSize, totalElements, totalPages, searchParams: currentParams } = pageData
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()

  // Modal Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<BrandItem | null>(null)

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

  const handleSort = (field: BrandSortField) => {
    const isCurrentField = currentParams.sortField === field
    const newDir: SortDirection = isCurrentField && currentParams.sortDir === 'asc' ? 'desc' : 'asc'
    updateQueryParams({ sortField: field, sortDir: newDir })
  }

  const handleEditClick = (brand: BrandItem) => {
    navigate(`/admin/manage-brand/edit/${brand.id}`)
  }

  const handleOpenDeleteModal = (brand: BrandItem) => {
    setBrandToDelete(brand)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return
    await deleteBrand(brandToDelete.id)
    showToast('success', 'toasts.brandDeleted')
    updateQueryParams({ _t: String(Date.now()) })
  }

  const handleRefresh = () => {
    updateQueryParams({ _t: String(Date.now()) })
    showToast('info', 'toasts.brandRefreshed')
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Header section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <div className='w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center'>
              <Award className='size-5' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50'>
              {t('brand.title')}
            </h1>
            <Badge variant='secondary' className='ml-1 font-semibold'>
              {t('brand.totalCount', { count: totalElements })}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>
            {t('brand.subtitle')}
          </p>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button
            variant='outline'
            size='icon'
            onClick={handleRefresh}
            title={t('brand.refresh')}
            disabled={isLoading}
            className='bg-white dark:bg-zinc-900 shadow-xs'
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className='sr-only'>{t('brand.refresh')}</span>
          </Button>

          <Button asChild className='shadow-xs gap-1.5'>
            <Link to='/admin/manage-brand/create'>
              <Plus className='size-4' />
              {t('brand.addNew')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='space-y-4'>
        {/* Search & Action Bar */}
        <div className='flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs'>
          <BrandSearch
            value={currentParams.search}
            onChange={handleSearchChange}
            isLoading={isLoading}
          />
        </div>

        {/* Brand Table */}
        <BrandTable
          brands={content}
          isLoading={isLoading}
          sortField={currentParams.sortField}
          sortOrder={currentParams.sortDir}
          onSort={handleSort}
          onEdit={handleEditClick}
          onDelete={handleOpenDeleteModal}
        />

        {/* Pagination */}
        <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs p-2'>
          <BrandPagination
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
      <BrandDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        brandToDelete={brandToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
