import { useState } from "react"
import { Award, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { BrandItem, SortDirection, BrandSortField } from "~/shared/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/core/components/shadcn/table"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Button } from "~/core/components/shadcn/button"
import { Skeleton } from "~/core/components/shadcn/skeleton"
import { cn } from "~/shared/utils/appUtils"

export type { BrandSortField }

interface BrandTableProps {
  brands: BrandItem[]
  isLoading?: boolean
  selectedIds?: (string | number)[]
  onToggleSelect?: (id: string | number) => void
  onToggleSelectAll?: () => void
  sortField?: BrandSortField
  sortOrder?: SortDirection
  onSort: (field: BrandSortField) => void
  onEdit: (brand: BrandItem) => void
}

function formatDate(isoString?: string | null): { dateStr: string; timeStr: string } {
  if (!isoString) return { dateStr: "-", timeStr: "" }
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return { dateStr: isoString, timeStr: "" }
    const dateStr = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    })
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
    return { dateStr, timeStr }
  } catch {
    return { dateStr: isoString, timeStr: "" }
  }
}

export default function BrandTable({
  brands,
  isLoading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  sortField,
  sortOrder,
  onSort,
  onEdit
}: BrandTableProps) {
  const { t } = useTranslation()
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  const isAllSelected = brands.length > 0 && brands.every((brand) => selectedIds.includes(brand.id))
  const isSomeSelected = brands.some((brand) => selectedIds.includes(brand.id)) && !isAllSelected

  const handleImageError = (id: string | number) => {
    setFailedImages((prev) => ({ ...prev, [String(id)]: true }))
  }

  const renderSortIcon = (field: BrandSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className='size-3.5 ml-1 text-muted-foreground/60' />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className='size-3.5 ml-1 text-primary' />
    ) : (
      <ArrowDown className='size-3.5 ml-1 text-primary' />
    )
  }

  return (
    <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs overflow-hidden'>
      <Table>
        <TableHeader className='bg-gray-50/80 dark:bg-zinc-800/50'>
          <TableRow className='hover:bg-transparent'>
            {/* Checkbox Column */}
            <TableHead className='w-[48px] px-4'>
              <Checkbox
                checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
                onCheckedChange={() => onToggleSelectAll?.()}
                aria-label='Select all brands on current page'
              />
            </TableHead>

            {/* Logo Column */}
            <TableHead className='w-[80px] text-center font-semibold text-gray-700 dark:text-gray-200'>
              {t("brand.logo")}
            </TableHead>

            <TableHead>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort("name")}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t("brand.name")}
                {renderSortIcon("name")}
              </Button>
            </TableHead>

            <TableHead className='hidden md:table-cell'>
              <span className='font-semibold text-gray-700 dark:text-gray-200'>
                {t("brand.description", "Description")}
              </span>
            </TableHead>

            <TableHead className='w-[190px]'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort("createdAt")}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t("brand.createdAt")}
                {renderSortIcon("createdAt")}
              </Button>
            </TableHead>

            <TableHead className='w-[190px] hidden sm:table-cell'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort("updatedAt")}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t("brand.updatedAt")}
                {renderSortIcon("updatedAt")}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={`skeleton-${idx}`}>
                <TableCell className='w-[48px] px-4 py-4'>
                  <Skeleton className='h-4 w-4 rounded-[4px]' />
                </TableCell>
                <TableCell className='py-4 text-center'>
                  <Skeleton className='size-10 rounded-lg mx-auto' />
                </TableCell>
                <TableCell className='py-4'>
                  <Skeleton className='h-5 w-40' />
                </TableCell>
                <TableCell className='py-4 hidden md:table-cell'>
                  <Skeleton className='h-5 w-48' />
                </TableCell>
                <TableCell className='py-4'>
                  <Skeleton className='h-5 w-32' />
                </TableCell>
                <TableCell className='py-4 hidden sm:table-cell'>
                  <Skeleton className='h-5 w-32' />
                </TableCell>
              </TableRow>
            ))
          ) : brands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                  <div className='w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center'>
                    <Award className='size-6 text-gray-400' />
                  </div>
                  <p className='font-medium text-gray-800 dark:text-gray-200'>{t("brand.noBrandsFound")}</p>
                  <p className='text-xs text-gray-500'>{t("brand.adjustSearchOrAdd")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            brands.map((brand) => {
              const created = formatDate(brand.createdAt)
              const updated = formatDate(brand.updatedAt)
              const isImgFailed = failedImages[String(brand.id)]
              const isSelected = selectedIds.includes(brand.id)

              return (
                <TableRow
                  key={brand.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "group transition-colors hover:bg-gray-50/60 dark:hover:bg-zinc-800/40",
                    isSelected && "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  {/* Checkbox */}
                  <TableCell className='w-[48px] px-4 py-3.5'>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect?.(brand.id)}
                      aria-label={`Select ${brand.name}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>

                  {/* Image / Logo */}
                  <TableCell className='py-3.5 text-center'>
                    <div className='w-10 h-10 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5 overflow-hidden flex items-center justify-center mx-auto shadow-xs group-hover:border-primary/50 transition-colors'>
                      {brand.image && !isImgFailed ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          onError={() => handleImageError(brand.id)}
                          className='w-full h-full object-contain rounded-md'
                        />
                      ) : (
                        <Award className='size-5 text-amber-500/70' />
                      )}
                    </div>
                  </TableCell>

                  {/* Brand Name (clickable) */}
                  <TableCell className='py-3.5'>
                    <button
                      type='button'
                      onClick={() => onEdit(brand)}
                      className='font-semibold text-gray-900 dark:text-gray-100 hover:text-primary hover:underline transition-colors text-sm text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs'
                      title={`Edit ${brand.name}`}
                    >
                      {brand.name}
                    </button>
                  </TableCell>

                  {/* Description */}
                  <TableCell className='py-3.5 hidden md:table-cell text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate'>
                    {brand.description || "-"}
                  </TableCell>

                  {/* Created At */}
                  <TableCell className='py-3.5 text-xs text-gray-600 dark:text-gray-400'>
                    <div className='flex items-center gap-1.5'>
                      <Calendar className='size-3.5 text-muted-foreground shrink-0' />
                      <span>{created.dateStr}</span>
                      {created.timeStr && (
                        <span className='text-gray-400 dark:text-gray-500 font-mono'>{created.timeStr}</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Updated At */}
                  <TableCell className='py-3.5 text-xs text-gray-600 dark:text-gray-400 hidden sm:table-cell'>
                    <div className='flex items-center gap-1.5'>
                      <Calendar className='size-3.5 text-muted-foreground shrink-0' />
                      <span>{updated.dateStr}</span>
                      {updated.timeStr && (
                        <span className='text-gray-400 dark:text-gray-500 font-mono'>{updated.timeStr}</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
