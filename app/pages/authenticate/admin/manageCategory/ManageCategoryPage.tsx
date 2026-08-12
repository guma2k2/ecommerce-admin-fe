import * as React from "react"
import { useLoaderData, useSearchParams, useNavigation } from "react-router"
import type { ClientLoaderFunctionArgs } from "react-router"
import { Plus, FolderTree, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryItem,
} from "~/shared/services/api/categoryService"
import CategorySearch from "~/features/authenticate/manageCategory/components/CategorySearch"
import CategoryTable, {
  type SortField,
  type SortOrder,
} from "~/features/authenticate/manageCategory/components/CategoryTable"
import CategoryPagination from "~/features/authenticate/manageCategory/components/CategoryPagination"
import CategoryFormDialog from "~/features/authenticate/manageCategory/components/CategoryFormDialog"
import CategoryDeleteDialog from "~/features/authenticate/manageCategory/components/CategoryDeleteDialog"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get("page") || "1")
  const limit = Number(url.searchParams.get("limit") || "10")
  const search = url.searchParams.get("search") || ""
  const sort = (url.searchParams.get("sort") as SortField) || "id"
  const order = (url.searchParams.get("order") as SortOrder) || "asc"

  const response = await getCategories({ page, limit, search })

  // Sort categories according to sort field and order
  const sortedData = [...response.data].sort((a, b) => {
    let valA = a[sort] || ""
    let valB = b[sort] || ""

    if (sort === "id") {
      const numA = parseInt(valA.replace("CAT-", ""), 10)
      const numB = parseInt(valB.replace("CAT-", ""), 10)
      if (!isNaN(numA) && !isNaN(numB)) {
        return order === "asc" ? numA - numB : numB - numA
      }
    }

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

export default function ManageCategoryPage() {
  const { data, pagination, searchParams: currentParams } = useLoaderData<typeof clientLoader>()
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()

  // Modal Dialog States
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [categoryToEdit, setCategoryToEdit] = React.useState<CategoryItem | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [categoryToDelete, setCategoryToDelete] = React.useState<CategoryItem | null>(null)

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

  const handleSort = (field: SortField) => {
    const isCurrentField = currentParams.sort === field
    const newOrder: SortOrder = isCurrentField && currentParams.order === "asc" ? "desc" : "asc"
    updateQueryParams({ sort: field, order: newOrder })
  }

  const handleOpenCreateModal = () => {
    setCategoryToEdit(null)
    setFormDialogOpen(true)
  }

  const handleOpenEditModal = (category: CategoryItem) => {
    setCategoryToEdit(category)
    setFormDialogOpen(true)
  }

  const handleOpenDeleteModal = (category: CategoryItem) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (name: string) => {
    if (categoryToEdit) {
      await updateCategory(categoryToEdit.id, name)
      toast.success(`Category "${name}" updated successfully`)
    } else {
      const newCat = await createCategory(name)
      toast.success(`Category "${newCat.name}" (${newCat.id}) created successfully`)
    }
    // Refresh page data
    updateQueryParams({ _t: String(Date.now()) })
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    await deleteCategory(categoryToDelete.id)
    toast.success(`Category "${categoryToDelete.name}" deleted successfully`)
    updateQueryParams({ _t: String(Date.now()) })
  }

  const handleRefresh = () => {
    updateQueryParams({ _t: String(Date.now()) })
    toast.info("Refreshed category list")
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FolderTree className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Category Management
            </h1>
            <Badge variant="secondary" className="ml-1 font-semibold">
              {pagination.totalItems} Categories
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            View, create, update, and manage product categories (ID, Name, Created At, Updated At).
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
            <span className="sr-only">Refresh categories</span>
          </Button>

          <Button onClick={handleOpenCreateModal} className="shadow-xs gap-1.5">
            <Plus className="size-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Search & Action Bar */}
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs">
          <CategorySearch
            value={currentParams.search}
            onChange={handleSearchChange}
            isLoading={isLoading}
          />
        </div>

        {/* Category Table */}
        <CategoryTable
          categories={data}
          isLoading={isLoading}
          sortField={currentParams.sort}
          sortOrder={currentParams.order}
          onSort={handleSort}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />

        {/* Pagination */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs p-2">
          <CategoryPagination
            page={pagination.page}
            limit={pagination.limit}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>

      {/* Create / Edit Form Dialog */}
      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        categoryToEdit={categoryToEdit}
        onSubmit={handleFormSubmit}
      />

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
