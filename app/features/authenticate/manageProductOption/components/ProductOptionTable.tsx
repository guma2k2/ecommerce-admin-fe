import {
  SlidersHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type {
  ProductOptionResponse,
  SortDirection,
  ProductOptionSortField
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
import { Badge } from '~/core/components/shadcn/badge'
import { Skeleton } from '~/core/components/shadcn/skeleton'

export type { ProductOptionSortField }

interface ProductOptionTableProps {
  options: ProductOptionResponse[]
  isLoading?: boolean
  sortField?: ProductOptionSortField
  sortOrder?: SortDirection
  onSort: (field: ProductOptionSortField) => void
  onEdit: (option: ProductOptionResponse) => void
  onDelete: (option: ProductOptionResponse) => void
}

export default function ProductOptionTable({
  options,
  isLoading = false,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}: ProductOptionTableProps) {
  const { t } = useTranslation()

  const renderSortIcon = (field: ProductOptionSortField) => {
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
            {/* ID Column */}
            <TableHead className='w-[100px]'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort('id')}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                ID
                {renderSortIcon('id')}
              </Button>
            </TableHead>

            {/* Option Name Column */}
            <TableHead>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSort('name')}
                className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
              >
                {t('productOption.name')}
                {renderSortIcon('name')}
              </Button>
            </TableHead>

            {/* Actions Column */}
            <TableHead className='w-[120px] text-right pr-6 font-semibold text-gray-700 dark:text-gray-200'>
              {t('productOption.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell className='py-4'>
                  <Skeleton className='h-4 w-12' />
                </TableCell>
                <TableCell className='py-4'>
                  <div className='flex items-center gap-2.5'>
                    <Skeleton className='size-8 rounded-md' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                </TableCell>
                <TableCell className='text-right pr-6 py-4'>
                  <div className='flex items-center justify-end gap-1'>
                    <Skeleton className='size-8 rounded-md' />
                    <Skeleton className='size-8 rounded-md' />
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
                    {t('productOption.noOptionsFound')}
                  </h3>
                  <p className='text-sm text-muted-foreground max-w-sm'>
                    {t('productOption.adjustSearchOrAdd')}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            options.map((option) => (
              <TableRow
                key={option.id}
                className='hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors group'
              >
                {/* ID */}
                <TableCell className='font-mono text-xs text-muted-foreground'>
                  #{option.id}
                </TableCell>

                {/* Option Name */}
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <div className='size-8 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                      <SlidersHorizontal className='size-4' />
                    </div>
                    <div className='flex flex-col'>
                      <span className='font-medium text-gray-900 dark:text-gray-100 text-sm'>
                        {option.name}
                      </span>
                    </div>
                    {['color', 'size', 'material', 'storage', 'style'].includes(option.name.toLowerCase()) && (
                      <Badge variant='outline' className='text-[10px] uppercase tracking-wider text-muted-foreground/80 py-0 px-1.5 h-4 flex items-center gap-1'>
                        <Sparkles className='size-2.5 text-amber-500' />
                        Standard
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className='text-right pr-6'>
                  <div className='flex items-center justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onEdit(option)}
                      className='size-8 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                      title={t('button.edit')}
                    >
                      <Pencil className='size-4' />
                      <span className='sr-only'>{t('button.edit')}</span>
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onDelete(option)}
                      className='size-8 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                      title={t('button.delete')}
                    >
                      <Trash2 className='size-4' />
                      <span className='sr-only'>{t('button.delete')}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
