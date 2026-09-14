import { Folder, FolderTree, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { CategoryItem, SortDirection, SortField, CategorySortField } from "~/shared/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/core/components/shadcn/table"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"
import { Skeleton } from "~/core/components/shadcn/skeleton"
import { cn } from "~/shared/utils/appUtils"

export type { SortField, CategorySortField }

interface CategoryTableProps {
  categories: CategoryItem[]
  isLoading?: boolean
  selectedIds?: (string | number)[]
  onToggleSelect?: (id: string | number) => void
  onToggleSelectAll?: () => void
  sortField?: SortField
  sortOrder?: SortDirection
  onSort: (field: SortField) => void
  onEdit: (category: CategoryItem) => void
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

export default function CategoryTable({
  categories,
  isLoading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  sortField,
  sortOrder,
  onSort,
  onEdit
}: CategoryTableProps) {
  const { t } = useTranslation()

  const isAllSelected = categories.length > 0 && categories.every((cat) => selectedIds.includes(cat.id))
  const isSomeSelected = categories.some((cat) => selectedIds.includes(cat.id)) && !isAllSelected

  const renderSortIcon = (field: SortField) => {
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
                aria-label='Select all categories on current page'
              />
            </TableHead>

            {/* Category Name */}
            <TableHead>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort("name")}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t("category.name")}
                {renderSortIcon("name")}
              </Button>
            </TableHead>

            {/* Parent Category */}
            <TableHead className='w-[220px]'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort("parent")}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t("category.parentCategory")}
                {renderSortIcon("parent")}
              </Button>
            </TableHead>

            {/* Created At */}
            <TableHead className='w-[190px]'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort("createdAt")}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t("category.createdAt")}
                {renderSortIcon("createdAt")}
              </Button>
            </TableHead>

            {/* Updated At */}
            <TableHead className='w-[190px] hidden sm:table-cell'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort("updatedAt")}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t("category.updatedAt")}
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
                <TableCell className='py-4'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='size-8 rounded-lg' />
                    <Skeleton className='h-5 w-40' />
                  </div>
                </TableCell>
                <TableCell className='py-4'>
                  <Skeleton className='h-5 w-28' />
                </TableCell>
                <TableCell className='py-4'>
                  <Skeleton className='h-5 w-32' />
                </TableCell>
                <TableCell className='py-4 hidden sm:table-cell'>
                  <Skeleton className='h-5 w-32' />
                </TableCell>
              </TableRow>
            ))
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                  <div className='w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center'>
                    <Folder className='size-6 text-gray-400' />
                  </div>
                  <p className='font-medium text-gray-800 dark:text-gray-200'>{t("category.noCategoriesFound")}</p>
                  <p className='text-xs text-gray-500'>{t("category.adjustSearchOrAdd")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => {
              const created = formatDate(category.createdAt)
              const updated = formatDate(category.updatedAt)
              const isSelected = selectedIds.includes(category.id)

              return (
                <TableRow
                  key={category.id}
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
                      onCheckedChange={() => onToggleSelect?.(category.id)}
                      aria-label={`Select ${category.name}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>

                  {/* Category Name (clickable) */}
                  <TableCell className='py-3.5'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                        <Folder className='size-4' />
                      </div>
                      <button
                        type='button'
                        onClick={() => onEdit(category)}
                        className='font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary hover:underline transition-colors text-sm text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs'
                        title={`Edit ${category.name}`}
                      >
                        {category.name}
                      </button>
                    </div>
                  </TableCell>

                  {/* Parent Category */}
                  <TableCell className='py-3.5'>
                    {category.parent ? (
                      <div className='flex items-center gap-1.5'>
                        <Badge variant='outline' className='font-normal text-xs gap-1 bg-gray-50 dark:bg-zinc-800'>
                          <FolderTree className='size-3 text-primary/70' />
                          {category.parent.name}
                        </Badge>
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground italic font-medium'>
                        {t("category.rootCategory")}
                      </span>
                    )}
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
