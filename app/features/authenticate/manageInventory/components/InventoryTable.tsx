import {
  SlidersHorizontal,
  ClipboardCheck,
  History,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  PackageX
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/core/components/shadcn/table'
import { Badge } from '~/core/components/shadcn/badge'
import { Button } from '~/core/components/shadcn/button'
import { Skeleton } from '~/core/components/shadcn/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/core/components/shadcn/tooltip'
import type { InventoryItem, SortDirection } from '~/shared/types'
import { formatDateTime } from '~/shared/utils/appUtils'

interface InventoryTableProps {
  inventories: InventoryItem[]
  isLoading?: boolean
  sortField?: keyof InventoryItem
  sortDir?: SortDirection
  onSort?: (field: keyof InventoryItem) => void
  onAdjustStock: (item: InventoryItem) => void
  onCycleCount: (item: InventoryItem) => void
  onViewMovements: (item: InventoryItem) => void
}

export default function InventoryTable({
  inventories,
  isLoading = false,
  sortField,
  sortDir,
  onSort,
  onAdjustStock,
  onCycleCount,
  onViewMovements
}: InventoryTableProps) {
  const { t } = useTranslation()

  const renderSortIcon = (field: keyof InventoryItem) => {
    if (sortField !== field) {
      return <ArrowUpDown className='size-3.5 opacity-40 ml-1' aria-hidden='true' />
    }
    return sortDir === 'asc' ? (
      <ArrowUp className='size-3.5 text-primary ml-1' aria-hidden='true' />
    ) : (
      <ArrowDown className='size-3.5 text-primary ml-1' aria-hidden='true' />
    )
  }

  const getStatusBadge = (item: InventoryItem) => {
    if (item.available === 0) {
      return (
        <Badge
          variant='destructive'
          className='font-medium text-xs px-2 py-0.5 whitespace-nowrap'
        >
          {t('inventory.outOfStock')}
        </Badge>
      )
    }
    if (item.available <= 10) {
      return (
        <Badge
          className='bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium text-xs px-2 py-0.5 whitespace-nowrap'
        >
          {t('inventory.lowStock')}
        </Badge>
      )
    }
    return (
      <Badge
        className='bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium text-xs px-2 py-0.5 whitespace-nowrap'
      >
        {t('inventory.inStock')}
      </Badge>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs overflow-hidden'>
        <Table>
          <TableHeader className='bg-gray-50/80 dark:bg-zinc-800/50'>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='w-[240px]'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onSort?.('sku')}
                  className='-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
                >
                  {t('inventory.sku')}
                  {renderSortIcon('sku')}
                </Button>
              </TableHead>
              <TableHead className='text-right'>
                <div className='flex justify-end'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onSort?.('onHand')}
                    className='-mr-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
                  >
                    {t('inventory.onHand')}
                    {renderSortIcon('onHand')}
                  </Button>
                </div>
              </TableHead>
              <TableHead className='text-right'>
                <div className='flex justify-end'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onSort?.('reserved')}
                    className='-mr-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
                  >
                    {t('inventory.reserved')}
                    {renderSortIcon('reserved')}
                  </Button>
                </div>
              </TableHead>
              <TableHead className='text-right'>
                <div className='flex justify-end'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onSort?.('available')}
                    className='-mr-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
                  >
                    {t('inventory.available')}
                    {renderSortIcon('available')}
                  </Button>
                </div>
              </TableHead>
              <TableHead className='font-semibold text-center'>
                {t('inventory.status')}
              </TableHead>
              <TableHead className='font-semibold text-center hidden md:table-cell'>
                {t('inventory.lastUpdated')}
              </TableHead>
              <TableHead className='font-semibold text-right pr-6'>
                {t('inventory.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-row-${index}`}>
                  <TableCell>
                    <div className='space-y-1.5'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-16' />
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Skeleton className='h-4 w-12 ml-auto' />
                  </TableCell>
                  <TableCell className='text-right'>
                    <Skeleton className='h-4 w-12 ml-auto' />
                  </TableCell>
                  <TableCell className='text-right'>
                    <Skeleton className='h-4 w-12 ml-auto' />
                  </TableCell>
                  <TableCell className='text-center'>
                    <Skeleton className='h-5 w-20 mx-auto rounded-full' />
                  </TableCell>
                  <TableCell className='text-center hidden md:table-cell'>
                    <Skeleton className='h-4 w-28 mx-auto' />
                  </TableCell>
                  <TableCell className='text-right pr-6'>
                    <div className='flex items-center justify-end gap-1'>
                      <Skeleton className='size-8 rounded-md' />
                      <Skeleton className='size-8 rounded-md' />
                      <Skeleton className='size-8 rounded-md' />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : inventories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-48 text-center'>
                  <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                    <PackageX className='size-9 stroke-[1.5]' aria-hidden='true' />
                    <p className='font-medium text-gray-900 dark:text-gray-100 text-sm'>
                      {t('inventory.noInventoriesFound')}
                    </p>
                    <p className='text-xs max-w-sm'>
                      {t('inventory.adjustSearchPrompt')}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              inventories.map((item) => (
                <TableRow
                  key={item.id}
                  className='hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors duration-150'
                >
                  {/* SKU & Variant Info */}
                  <TableCell className='min-w-0 font-medium'>
                    <div className='flex flex-col'>
                      <span className='font-mono font-semibold text-sm text-gray-900 dark:text-gray-50 truncate'>
                        {item.sku}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {t('inventory.variantId')}: #{item.productVariantId}
                      </span>
                    </div>
                  </TableCell>

                  {/* On-Hand Physical Stock */}
                  <TableCell className='text-right font-semibold tabular-nums text-sm text-gray-900 dark:text-gray-50'>
                    {item.onHand.toLocaleString()}
                  </TableCell>

                  {/* Reserved (Checkout Holds) */}
                  <TableCell className='text-right tabular-nums text-sm'>
                    {item.reserved > 0 ? (
                      <span className='font-semibold text-amber-600 dark:text-amber-400'>
                        {item.reserved.toLocaleString()}
                      </span>
                    ) : (
                      <span className='text-muted-foreground'>0</span>
                    )}
                  </TableCell>

                  {/* Available Stock */}
                  <TableCell className='text-right font-semibold tabular-nums text-sm'>
                    <span
                      className={
                        item.available === 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : item.available <= 10
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-gray-900 dark:text-gray-50'
                      }
                    >
                      {item.available.toLocaleString()}
                    </span>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className='text-center'>
                    {getStatusBadge(item)}
                  </TableCell>

                  {/* Last Updated */}
                  <TableCell className='text-center text-xs text-muted-foreground hidden md:table-cell'>
                    {formatDateTime(item.updatedAt || item.createdAt)}
                  </TableCell>

                  {/* Operational Action Buttons */}
                  <TableCell className='text-right pr-6'>
                    <div className='flex items-center justify-end gap-1.5'>
                      {/* Stock Adjustment Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => onAdjustStock(item)}
                            className='size-8 cursor-pointer text-gray-700 dark:text-zinc-300 hover:text-primary hover:border-primary/50'
                            aria-label={`${t('inventory.adjustStock')} for SKU ${item.sku}`}
                          >
                            <SlidersHorizontal className='size-3.5' aria-hidden='true' />
                            <span className='sr-only'>{t('inventory.adjustStock')}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='text-xs'>{t('inventory.adjustStock')}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Physical Cycle Count Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => onCycleCount(item)}
                            className='size-8 cursor-pointer text-gray-700 dark:text-zinc-300 hover:text-emerald-600 hover:border-emerald-500/50'
                            aria-label={`${t('inventory.cycleCount')} for SKU ${item.sku}`}
                          >
                            <ClipboardCheck className='size-3.5' aria-hidden='true' />
                            <span className='sr-only'>{t('inventory.cycleCount')}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='text-xs'>{t('inventory.cycleCount')}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Movements Audit Log Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => onViewMovements(item)}
                            className='size-8 cursor-pointer text-gray-700 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-500/50'
                            aria-label={`${t('inventory.viewMovements')} for SKU ${item.sku}`}
                          >
                            <History className='size-3.5' aria-hidden='true' />
                            <span className='sr-only'>{t('inventory.viewMovements')}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='text-xs'>{t('inventory.viewMovements')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
