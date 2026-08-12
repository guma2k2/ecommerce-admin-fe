import * as React from "react"
import { useLoaderData, useSearchParams, useNavigation, Link, useNavigate } from "react-router"
import type { ClientLoaderFunctionArgs } from "react-router"
import { Plus, Package } from "lucide-react"

import { getProducts } from "~/shared/services/api/productService"
import ProductSearch from "~/features/authenticate/manageProduct/components/ProductSearch"
import ProductTable from "~/features/authenticate/manageProduct/components/ProductTable"
import ProductPagination from "~/features/authenticate/manageProduct/components/ProductPagination"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get("page") || "1")
  const limit = Number(url.searchParams.get("limit") || "10")
  const search = url.searchParams.get("search") || ""

  const response = await getProducts({ page, limit, search })
  return {
    ...response,
    searchParams: { page, limit, search }
  }
}

clientLoader.hydrate = true as const

export default function ManageProductPage() {
  const { data, pagination, searchParams: currentParams } = useLoaderData<typeof clientLoader>()
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()

  const isLoading = navigation.state === "loading" || navigation.state === "submitting"

  const handleSearchChange = (newSearch: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newSearch) {
        next.set("search", newSearch)
      } else {
        next.delete("search")
      }
      next.set("page", "1") // Reset to first page on search
      return next
    })
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("page", String(newPage))
      return next
    })
  }

  const handleLimitChange = (newLimit: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("limit", String(newLimit))
      next.set("page", "1") // Reset to first page on limit change
      return next
    })
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6">
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Product Management
            </h1>
            <Badge variant="secondary" className="ml-1 font-semibold">
              {pagination.totalItems} Products
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your store inventory, view products, search, and edit product details.
          </p>
        </div>

        <Button asChild size="default" className="shadow-xs gap-1.5 self-start sm:self-auto">
          <Link to="/admin/manage-product/create">
            <Plus className="size-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Search & Actions Bar */}
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 shadow-2xs">
          <ProductSearch
            value={currentParams.search}
            onChange={handleSearchChange}
            isLoading={isLoading}
          />
        </div>

        {/* Product Table Component */}
        <ProductTable
          products={data}
          isLoading={isLoading}
          onEdit={(product) => {
            console.log("Edit product:", product)
          }}
          onDelete={(product) => {
            console.log("Delete product:", product)
          }}
        />

        {/* Pagination Component */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 shadow-2xs p-2">
          <ProductPagination
            page={pagination.page}
            limit={pagination.limit}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>
    </div>
  )
}
