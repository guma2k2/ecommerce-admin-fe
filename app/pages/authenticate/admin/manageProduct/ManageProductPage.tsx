import { useState } from "react"
import { useLoaderData, useSearchParams, useNavigation, Link, useNavigate, useRevalidator } from "react-router"
import type { ClientLoaderFunctionArgs } from "react-router"
import { Plus, Package, Trash2 } from "lucide-react"

import { getProducts, deleteProduct } from "~/shared/services/api/productService"
import { showToast } from "~/shared/utils/toast"
import { useTableSelection } from "~/shared/hooks"
import ProductSearch from "~/features/authenticate/manageProduct/components/ProductSearch"
import ProductTable from "~/features/authenticate/manageProduct/components/ProductTable"
import ProductPagination from "~/features/authenticate/manageProduct/components/ProductPagination"
import ProductDeleteDialog from "~/features/authenticate/manageProduct/components/ProductDeleteDialog"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const pageNumber = Number(url.searchParams.get("pageNumber") || url.searchParams.get("page") || "1")
  const pageSize = Number(url.searchParams.get("pageSize") || url.searchParams.get("limit") || "10")
  const search = url.searchParams.get("search") || ""
  const sortField = url.searchParams.get("sortField") || undefined
  const sortDir = (url.searchParams.get("sortDir") || undefined) as any

  const response = await getProducts({ pageNumber, pageSize, search, sortField, sortDir })
  return {
    ...response,
    searchParams: { pageNumber, pageSize, search, sortField, sortDir }
  }
}

clientLoader.hydrate = true as const

export default function ManageProductPage() {
  const pageData = useLoaderData<typeof clientLoader>()
  const { content, pageNumber, pageSize, totalElements, totalPages, searchParams: currentParams } = pageData
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()
  const revalidator = useRevalidator()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { selectedIds, toggleSelect, toggleSelectAll, clearSelection, selectedCount } = useTableSelection<
    string | number
  >()

  const isLoading = navigation.state === "loading" || navigation.state === "submitting"

  const selectedProducts = content.filter((p) => selectedIds.includes(p.id))

  const handleSearchChange = (newSearch: string) => {
    clearSelection()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newSearch) {
        next.set("search", newSearch)
      } else {
        next.delete("search")
      }
      next.set("pageNumber", "1") // Reset to first page on search
      return next
    })
  }

  const handlePageChange = (newPageNumber: number) => {
    clearSelection()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("pageNumber", String(newPageNumber))
      return next
    })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    clearSelection()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("pageSize", String(newPageSize))
      next.set("pageNumber", "1") // Reset to first page on limit change
      return next
    })
  }

  const handleDeleteConfirm = async () => {
    if (selectedCount === 0) return
    try {
      await Promise.all(selectedIds.map((id) => deleteProduct(id)))
      showToast("success", "toasts.deletedSuccess")
      clearSelection()
      revalidator.revalidate()
    } catch (error: any) {
      console.error("Delete product error:", error)
      showToast("error", error?.response?.data?.message || "Failed to delete selected product(s)")
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Top Header section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Package className='size-6 text-primary' />
            <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50'>Product Management</h1>
            <Badge variant='secondary' className='ml-1 font-semibold'>
              {totalElements} Products
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>
            Manage your store inventory, view products, search, and edit product details.
          </p>
        </div>

        <Button asChild size='default' className='shadow-xs gap-1.5 self-start sm:self-auto'>
          <Link to='/admin/manage-product/create'>
            <Plus className='size-4' />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Main Content Area */}
      <div className='space-y-4'>
        {/* Search & Actions Bar */}
        <div className='flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 shadow-2xs'>
          <ProductSearch value={currentParams.search} onChange={handleSearchChange} isLoading={isLoading} />

          <Button
            type='button'
            variant='destructive'
            disabled={selectedCount === 0 || isLoading}
            onClick={() => setDeleteDialogOpen(true)}
            className='gap-2 shrink-0 cursor-pointer'
          >
            <Trash2 className='size-4' />
            Delete {selectedCount > 0 ? `(${selectedCount})` : ""}
          </Button>
        </div>

        {/* Product Table Component */}
        <ProductTable
          products={content}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={() => toggleSelectAll(content.map((p) => p.id))}
          onEdit={(product) => {
            navigate(`/admin/manage-product/edit/${product.id}`)
          }}
        />

        {/* Pagination Component */}
        <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 shadow-2xs p-2'>
          <ProductPagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Batch / Single Product Delete Confirmation Dialog */}
      <ProductDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedCount={selectedCount}
        selectedProducts={selectedProducts}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
