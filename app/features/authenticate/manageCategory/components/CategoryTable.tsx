import { Folder, FolderTree, Pencil, Trash2, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CategoryItem, SortDirection, SortField, CategorySortField } from '~/shared/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/core/components/shadcn/table'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import { Skeleton } from '~/core/components/shadcn/skeleton'

export type { SortField, CategorySortField }

interface CategoryTableProps {
  categories: CategoryItem[]
  isLoading?: boolean
  sortField?: SortField
  sortOrder?: SortDirection
  onSort: (field: SortField) => void
  onEdit: (category: CategoryItem) => void
  onDelete: (category: CategoryItem) => void
}

function formatDate(isoString?: string | null): { dateStr: string; timeStr: string } {
  if (!isoString) return { dateStr: '-', timeStr: '' }
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return { dateStr: isoString, timeStr: '' }
    const dateStr = d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    })
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return { dateStr, timeStr }
  } catch {
    return { dateStr: isoString, timeStr: '' }
  }
}

export default function CategoryTable({
  categories,
  isLoading = false,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}: CategoryTableProps) {
  const { t } = useTranslation()

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className='size-3.5 ml-1 text-muted-foreground/60' />
    }
    return sortOrder === 'asc' ? (
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
            {/* Category Name */}
            <TableHead>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort('name')}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t('category.name')}
                {renderSortIcon('name')}
              </Button>
            </TableHead>

            {/* Parent Category */}
            <TableHead className='w-[220px]'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort('parent')}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t('category.parentCategory')}
                {renderSortIcon('parent')}
              </Button>
            </TableHead>

            {/* Created At */}
            <TableHead className='w-[190px]'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort('createdAt')}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t('category.createdAt')}
                {renderSortIcon('createdAt')}
              </Button>
            </TableHead>

            {/* Updated At */}
            <TableHead className='w-[190px] hidden sm:table-cell'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort('updatedAt')}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t('category.updatedAt')}
                {renderSortIcon('updatedAt')}
              </Button>
            </TableHead>

            {/* Actions */}
            <TableHead className='w-[110px] text-right font-semibold text-gray-700 dark:text-gray-200 pr-4'>
              {t('category.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={`skeleton-${idx}`}>
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
                <TableCell className='py-4 text-right pr-4'>
                  <div className='flex items-center justify-end gap-1'>
                    <Skeleton className='size-8 rounded-md' />
                    <Skeleton className='size-8 rounded-md' />
                  </div>
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
                  <p className='font-medium text-gray-800 dark:text-gray-200'>{t('category.noCategoriesFound')}</p>
                  <p className='text-xs text-gray-500'>{t('category.adjustSearchOrAdd')}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => {
              const created = formatDate(category.createdAt || category.created_at)
              const updated = formatDate(category.updatedAt || category.updated_at)

              return (
                <TableRow
                  key={category.id}
                  onClick={() => onEdit(category)}
                  className='group transition-colors hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 cursor-pointer'
                >
                  {/* Category Name */}
                  <TableCell className='py-3.5'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                        <Folder className='size-4' />
                      </div>
                      <span className='font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors'>
                        {category.name}
                      </span>
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
                        {t('category.rootCategory')}
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

                  {/* Actions */}
                  <TableCell className='py-3.5 text-right pr-4'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(category)
                        }}
                        className='h-8 w-8 text-gray-600 hover:text-primary hover:bg-primary/10 dark:text-gray-400 dark:hover:text-primary rounded-md'
                        title={t('button.edit')}
                      >
                        <Pencil className='size-4' />
                        <span className='sr-only'>{t('button.edit')}</span>
                      </Button>

                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(category)
                        }}
                        className='h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 rounded-md'
                        title={t('button.delete')}
                      >
                        <Trash2 className='size-4' />
                        <span className='sr-only'>{t('button.delete')}</span>
                      </Button>
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
