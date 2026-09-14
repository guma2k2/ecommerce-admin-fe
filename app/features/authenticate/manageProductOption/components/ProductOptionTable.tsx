import { SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { ProductOptionResponse, SortDirection, ProductOptionSortField } from "~/shared/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/core/components/shadcn/table"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"
import { Skeleton } from "~/core/components/shadcn/skeleton"
import { cn } from "~/shared/utils/appUtils"

export type { ProductOptionSortField }

interface ProductOptionTableProps {
  options: ProductOptionResponse[]
  isLoading?: boolean
  selectedIds?: (string | number)[]
  onToggleSelect?: (id: string | number) => void
  onToggleSelectAll?: () => void
  sortField?: ProductOptionSortField
  sortOrder?: SortDirection
  onSort: (field: ProductOptionSortField) => void
  onEdit: (option: ProductOptionResponse) => void
}

export default function ProductOptionTable({
  options,
  isLoading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  sortField,
  sortOrder,
  onSort,
  onEdit
}: ProductOptionTableProps) {
  const { t } = useTranslation()

  const isAllSelected = options.length > 0 && options.every((option) => selectedIds.includes(option.id))
  const isSomeSelected = options.some((option) => selectedIds.includes(option.id)) && !isAllSelected

  const renderSortIcon = (field: ProductOptionSortField) => {
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
                aria-label='Select all options on current page'
              />
            </TableHead>

            {/* ID Column */}
            <TableHead className='w-[100px]'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort("id")}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                ID
                {renderSortIcon("id")}
              </Button>
            </TableHead>

            {/* Option Name Column */}
            <TableHead>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort("name")}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t("productOption.name")}
                {renderSortIcon("name")}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell className='w-[48px] px-4 py-4'>
                  <Skeleton className='h-4 w-4 rounded-[4px]' />
                </TableCell>
                <TableCell className='py-4'>
                  <Skeleton className='h-4 w-12' />
                </TableCell>
                <TableCell className='py-4'>
                  <div className='flex items-center gap-2.5'>
                    <Skeleton className='size-8 rounded-md' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : options.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className='text-center py-12'>
                <div className='flex flex-col items-center justify-center gap-2'>
                  <div className='w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground'>
                    <SlidersHorizontal className='size-6' />
                  </div>
                  <h3 className='font-semibold text-base text-gray-900 dark:text-gray-100 mt-2'>
                    {t("productOption.noOptionsFound")}
                  </h3>
                  <p className='text-sm text-muted-foreground max-w-sm'>{t("productOption.adjustSearchOrAdd")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            options.map((option) => {
              const isSelected = selectedIds.includes(option.id)

              return (
                <TableRow
                  key={option.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "transition-colors group hover:bg-gray-50/50 dark:hover:bg-zinc-800/40",
                    isSelected && "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  {/* Checkbox */}
                  <TableCell className='w-[48px] px-4 py-4'>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect?.(option.id)}
                      aria-label={`Select ${option.name}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>

                  {/* ID */}
                  <TableCell className='font-mono text-xs text-muted-foreground py-4'>#{option.id}</TableCell>

                  {/* Option Name (clickable) */}
                  <TableCell className='py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='size-8 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                        <SlidersHorizontal className='size-4' />
                      </div>
                      <button
                        type='button'
                        onClick={() => onEdit(option)}
                        className='font-medium text-gray-900 dark:text-gray-100 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs'
                        title={`Edit ${option.name}`}
                      >
                        {option.name}
                      </button>
                      {["color", "size", "material", "storage", "style"].includes(option.name.toLowerCase()) && (
                        <Badge
                          variant='outline'
                          className='text-[10px] uppercase tracking-wider text-muted-foreground/80 py-0 px-1.5 h-4 flex items-center gap-1'
                        >
                          <Sparkles className='size-2.5 text-amber-500' />
                          Standard
                        </Badge>
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
