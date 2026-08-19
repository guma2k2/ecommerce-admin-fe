import {
  SlidersHorizontal,
  Pencil,
  Trash2,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type {
  ProductAttributeTemplateItem,
  SortDirection,
  ProductAttributeTemplateSortField
} from '~/shared/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/core/components/shadcn/table'
import { Button } from '~/core/components/shadcn/button'
import { Skeleton } from '~/core/components/shadcn/skeleton'

export type { ProductAttributeTemplateSortField }

interface ProductAttributeTemplateTableProps {
  templates: ProductAttributeTemplateItem[]
  isLoading?: boolean
  sortField: ProductAttributeTemplateSortField
  sortOrder: SortDirection
  onSort: (field: ProductAttributeTemplateSortField) => void
  onEdit: (template: ProductAttributeTemplateItem) => void
  onDelete: (template: ProductAttributeTemplateItem) => void
}

function formatDate(isoString: string): { dateStr: string; timeStr: string } {
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

export default function ProductAttributeTemplateTable({
  templates,
  isLoading = false,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}: ProductAttributeTemplateTableProps) {
  const { t } = useTranslation()

  const renderSortIcon = (field: ProductAttributeTemplateSortField) => {
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
            {/* Template Name Column */}
            <TableHead>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort('name')}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t('productAttributeTemplate.name')}
                {renderSortIcon('name')}
              </Button>
            </TableHead>

            {/* Created At Column */}
            <TableHead className='w-[220px]'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort('created_at')}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t('productAttributeTemplate.createdAt')}
                {renderSortIcon('created_at')}
              </Button>
            </TableHead>

            {/* Updated At Column */}
            <TableHead className='w-[220px]'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort('updated_at')}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t('productAttributeTemplate.updatedAt')}
                {renderSortIcon('updated_at')}
              </Button>
            </TableHead>

            {/* Actions Column */}
            <TableHead className='w-[110px] text-right font-semibold text-gray-700 dark:text-gray-200 pr-4'>
              {t('productAttributeTemplate.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={`skeleton-${idx}`}>
                <TableCell className='py-4'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='size-8 rounded-md' />
                    <Skeleton className='h-5 w-52' />
                  </div>
                </TableCell>
                <TableCell className='py-4'>
                  <Skeleton className='h-5 w-32' />
                </TableCell>
                <TableCell className='py-4'>
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
          ) : templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                  <div className='w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center'>
                    <SlidersHorizontal className='size-6 text-gray-400' />
                  </div>
                  <p className='font-medium text-gray-800 dark:text-gray-200'>
                    {t('productAttributeTemplate.noTemplatesFound')}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {t('productAttributeTemplate.adjustSearchOrAdd')}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => {
              const created = formatDate(template.created_at)
              const updated = formatDate(template.updated_at)

              return (
                <TableRow
                  key={template.id}
                  onClick={() => onEdit(template)}
                  className='group transition-colors hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 cursor-pointer'
                >
                  {/* Template Name */}
                  <TableCell className='py-3.5'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                        <SlidersHorizontal className='size-4' />
                      </div>
                      <div className='flex flex-col'>
                        <span className='font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors text-sm'>
                          {template.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Created At */}
                  <TableCell className='py-3.5 text-xs text-gray-600 dark:text-gray-400'>
                    <div className='flex items-center gap-1.5'>
                      <Calendar className='size-3.5 text-muted-foreground shrink-0' />
                      <span>{created.dateStr}</span>
                      <span className='text-gray-400 dark:text-gray-500 font-mono'>{created.timeStr}</span>
                    </div>
                  </TableCell>

                  {/* Updated At */}
                  <TableCell className='py-3.5 text-xs text-gray-600 dark:text-gray-400'>
                    <div className='flex items-center gap-1.5'>
                      <Calendar className='size-3.5 text-muted-foreground shrink-0' />
                      <span>{updated.dateStr}</span>
                      <span className='text-gray-400 dark:text-gray-500 font-mono'>{updated.timeStr}</span>
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
                          onEdit(template)
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
                          onDelete(template)
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
