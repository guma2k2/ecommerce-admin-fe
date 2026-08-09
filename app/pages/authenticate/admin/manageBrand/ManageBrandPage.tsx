import * as React from "react"
import { useLoaderData, useSearchParams, useNavigation } from "react-router"
import type { ClientLoaderFunctionArgs } from "react-router"
import { Plus, Award, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  type BrandItem,
} from "~/features/authenticate/manageBrand/services/brandService"
import BrandSearch from "~/features/authenticate/manageBrand/components/BrandSearch"
import BrandTable, {
  type BrandSortField,
  type SortOrder,
} from "~/features/authenticate/manageBrand/components/BrandTable"
import BrandPagination from "~/features/authenticate/manageBrand/components/BrandPagination"
import BrandFormDialog from "~/features/authenticate/manageBrand/components/BrandFormDialog"
import BrandDeleteDialog from "~/features/authenticate/manageBrand/components/BrandDeleteDialog"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get("page") || "1")
  const limit = Number(url.searchParams.get("limit") || "10")
  const search = url.searchParams.get("search") || ""
  const sort = (url.searchParams.get("sort") as BrandSortField) || "name"
  const order = (url.searchParams.get("order") as SortOrder) || "asc"

  const response = await getBrands({ page, limit, search })

  // Sort brands in memory
  const sortedData = [...response.data].sort((a, b) => {
    const valA = a[sort] || ""
    const valB = b[sort] || ""
    const comparison = valA.localeCompare(valB)
    return order === "asc" ? comparison : -comparison
  })

  return {
    ...response,
    data: sortedData,
    searchParams: { page, limit, search, sort, order },
  }
}

clientLoader.hydrate = true as const

export default function ManageBrandPage() {
  const { data, pagination, searchParams: currentParams } = useLoaderData<typeof clientLoader>()
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()

  // Modal Dialog States
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [brandToEdit, setBrandToEdit] = React.useState<BrandItem | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [brandToDelete, setBrandToDelete] = React.useState<BrandItem | null>(null)

  const isLoading = navigation.state === "loading" || navigation.state === "submitting"

  const updateQueryParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      })
      return next
    })
  }

  const handleSearchChange = (newSearch: string) => {
    updateQueryParams({ search: newSearch, page: "1" })
  }

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: String(newPage) })
  }

  const handleLimitChange = (newLimit: number) => {
    updateQueryParams({ limit: String(newLimit), page: "1" })
  }

  const handleSort = (field: BrandSortField) => {
    const isCurrentField = currentParams.sort === field
    const newOrder: SortOrder = isCurrentField && currentParams.order === "asc" ? "desc" : "asc"
    updateQueryParams({ sort: field, order: newOrder })
  }

  const handleOpenCreateModal = () => {
    setBrandToEdit(null)
    setFormDialogOpen(true)
  }

  const handleOpenEditModal = (brand: BrandItem) => {
    setBrandToEdit(brand)
    setFormDialogOpen(true)
  }

  const handleOpenDeleteModal = (brand: BrandItem) => {
    setBrandToDelete(brand)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (formData: { name: string; image: string }) => {
    if (brandToEdit) {
      await updateBrand(brandToEdit.id, formData)
      toast.success(`Brand "${formData.name}" updated successfully`)
    } else {
      const newBrand = await createBrand(formData)
      toast.success(`Brand "${newBrand.name}" created successfully`)
    }
    // Trigger loader re-fetch
    updateQueryParams({ _t: String(Date.now()) })
  }

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return
    await deleteBrand(brandToDelete.id)
    toast.success(`Brand "${brandToDelete.name}" deleted successfully`)
    updateQueryParams({ _t: String(Date.now()) })
  }

  const handleRefresh = () => {
    updateQueryParams({ _t: String(Date.now()) })
    toast.info("Refreshed brand list")
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Brand Management
            </h1>
            <Badge variant="secondary" className="ml-1 font-semibold">
              {pagination.totalItems} Brands
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your store's manufacturer and product brands (Logo, Name, Created At, Updated At).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh"
            disabled={isLoading}
            className="bg-white dark:bg-zinc-900 shadow-xs"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh brands</span>
          </Button>

          <Button onClick={handleOpenCreateModal} className="shadow-xs gap-1.5">
            <Plus className="size-4" />
            Add Brand
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Search & Action Bar */}
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs">
          <BrandSearch
            value={currentParams.search}
            onChange={handleSearchChange}
            isLoading={isLoading}
          />
        </div>

        {/* Brand Table (ID hidden) */}
        <BrandTable
          brands={data}
          isLoading={isLoading}
          sortField={currentParams.sort}
          sortOrder={currentParams.order}
          onSort={handleSort}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />

        {/* Pagination */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs p-2">
          <BrandPagination
            page={pagination.page}
            limit={pagination.limit}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>

      {/* Create / Edit Form Dialog (ID hidden) */}
      <BrandFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        brandToEdit={brandToEdit}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog (ID hidden) */}
      <BrandDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        brandToDelete={brandToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
