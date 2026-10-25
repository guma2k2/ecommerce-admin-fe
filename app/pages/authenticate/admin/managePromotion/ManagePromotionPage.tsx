import { useState } from "react"
import { useLoaderData, useSearchParams, useNavigation, useNavigate, Link, useRevalidator } from "react-router"
import type { ClientLoaderFunctionArgs } from "react-router"
import { Plus, Tag, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { getPromotions, deletePromotion } from "~/shared/services/api/promotionService"
import type { PromotionListItem } from "~/shared/types"
import { showToast } from "~/shared/utils/toast"
import { useTableSelection } from "~/shared/hooks"
import {
  PromotionSearch,
  PromotionTable,
  PromotionPagination,
  PromotionDeleteDialog
} from "~/features/authenticate/managePromotion"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const pageNumber = Number(url.searchParams.get("pageNumber") || url.searchParams.get("page") || "1")
  const pageSize = Number(url.searchParams.get("pageSize") || url.searchParams.get("limit") || "10")
  const search = url.searchParams.get("search") || ""

  const response = await getPromotions({
    pageNumber,
    pageSize,
    name: search,
    couponCode: search
  })

  return {
    ...response,
    searchParams: { pageNumber, pageSize, search }
  }
}

clientLoader.hydrate = true as const

export default function ManagePromotionPage() {
  const { t } = useTranslation()
  const pageData = useLoaderData<typeof clientLoader>()
  const { content, pageNumber, pageSize, totalElements, totalPages, searchParams: currentParams } = pageData
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()
  const revalidator = useRevalidator()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [promotionToDelete, setPromotionToDelete] = useState<PromotionListItem | null>(null)
  const { selectedIds, toggleSelect, toggleSelectAll, clearSelection, selectedCount } = useTableSelection<
    string | number
  >()

  const isLoading = navigation.state === "loading" || navigation.state === "submitting"
  const selectedPromotions = content.filter((p) => selectedIds.includes(p.id))

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
    clearSelection()
    updateQueryParams({ search: newSearch, pageNumber: "1" })
  }

  const handlePageChange = (newPageNumber: number) => {
    clearSelection()
    updateQueryParams({ pageNumber: String(newPageNumber) })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    clearSelection()
    updateQueryParams({ pageSize: String(newPageSize), pageNumber: "1" })
  }

  const handleDeleteConfirm = async () => {
    try {
      if (promotionToDelete) {
        await deletePromotion(promotionToDelete.id)
      } else if (selectedIds.length > 0) {
        await Promise.all(selectedIds.map((id) => deletePromotion(id)))
      }
      showToast("success", "toasts.deletedSuccess")
      clearSelection()
      setPromotionToDelete(null)
      revalidator.revalidate()
    } catch (error: any) {
      console.error("Delete promotion error:", error)
      showToast("error", error?.response?.data?.message || "Failed to delete promotion")
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <Tag className='size-6 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            {t("promotion.managementTitle", "Promotions")}
          </h1>
          <Badge variant='secondary' className='ml-1 font-semibold'>
            {totalElements}
          </Badge>
        </div>

        <Button asChild size='default' className='shadow-xs gap-1.5 self-start sm:self-auto'>
          <Link to='/admin/manage-promotion/create'>
            <Plus className='size-4' />
            {t("promotion.addPromotion", "Add Promotion")}
          </Link>
        </Button>
      </div>

      {/* Main Area */}
      <div className='space-y-4'>
        {/* Search & Bulk Actions Bar */}
        <div className='flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs'>
          <PromotionSearch value={currentParams.search} onChange={handleSearchChange} isLoading={isLoading} />

          <Button
            type='button'
            variant='destructive'
            disabled={selectedCount === 0 || isLoading}
            onClick={() => {
              setPromotionToDelete(null)
              setDeleteDialogOpen(true)
            }}
            className='gap-2 shrink-0 cursor-pointer'
          >
            <Trash2 className='size-4' />
            {t("button.delete", "Delete")} {selectedCount > 0 ? `(${selectedCount})` : ""}
          </Button>
        </div>

        {/* Promotion Table */}
        <PromotionTable
          promotions={content}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={() => toggleSelectAll(content.map((p) => p.id))}
          onEdit={(promo) => {
            navigate(`/admin/manage-promotion/edit/${promo.id}`)
          }}
          onDelete={(promo) => {
            setPromotionToDelete(promo)
            setDeleteDialogOpen(true)
          }}
        />

        {/* Pagination */}
        <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs p-2'>
          <PromotionPagination
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
      <PromotionDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedCount={selectedCount}
        selectedPromotions={selectedPromotions}
        promotionToDelete={promotionToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
