import { useEffect, useState, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  History,
  FileText,
  User,
  ArrowRight,
  RotateCw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '~/core/components/shadcn/sheet'
import { Badge } from '~/core/components/shadcn/badge'
import { Button } from '~/core/components/shadcn/button'
import { Skeleton } from '~/core/components/shadcn/skeleton'
import { ScrollArea } from '~/core/components/shadcn/scroll-area'
import { getStockMovements } from '~/shared/services/api/inventoryService'
import type { InventoryItem, MovementType, StockMovementItem } from '~/shared/types'
import { formatDateTime } from '~/shared/utils/appUtils'

interface StockMovementsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem | null
}

export default function StockMovementsSheet({
  open,
  onOpenChange,
  item
}: StockMovementsSheetProps) {
  const { t } = useTranslation()
  const [movements, setMovements] = useState<StockMovementItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const fetchMovements = useCallback(async (page = 1) => {
    if (!item) return
    try {
      setIsLoading(true)
      const res = await getStockMovements(item.productVariantId, page, 10)
      setMovements(res.content || [])
      setPageNumber(res.pageNumber || page)
      setTotalPages(res.totalPages || 1)
      setTotalElements(res.totalElements || 0)
    } catch (error) {
      console.error('Failed to load stock movements:', error)
      setMovements([])
    } finally {
      setIsLoading(false)
    }
  }, [item])

  useEffect(() => {
    if (open && item) {
      setPageNumber(1)
      fetchMovements(1)
    } else {
      setMovements([])
    }
  }, [open, item, fetchMovements])

  const getMovementTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'ADJUSTMENT':
        return (
          <Badge className='bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-[11px] px-2 py-0'>
            {t('inventory.types.ADJUSTMENT')}
          </Badge>
        )
      case 'CYCLE_COUNT':
        return (
          <Badge className='bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/20 text-[11px] px-2 py-0'>
            {t('inventory.types.CYCLE_COUNT')}
          </Badge>
        )
      case 'ORDER_DEDUCTION':
        return (
          <Badge className='bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[11px] px-2 py-0'>
            {t('inventory.types.ORDER_DEDUCTION')}
          </Badge>
        )
      case 'RESERVATION_RELEASE':
        return (
          <Badge className='bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] px-2 py-0'>
            {t('inventory.types.RESERVATION_RELEASE')}
          </Badge>
        )
      case 'INITIALIZATION':
      default:
        return (
          <Badge className='bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border border-zinc-500/20 text-[11px] px-2 py-0'>
            {t('inventory.types.INITIALIZATION')}
          </Badge>
        )
    }
  }

  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col gap-0'
      >
        <SheetHeader className='p-5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-primary'>
              <History className='size-5' aria-hidden='true' />
              <SheetTitle>
                {t('inventory.movementsTitle', { sku: item.sku })}
              </SheetTitle>
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => fetchMovements(pageNumber)}
              disabled={isLoading}
              className='size-8 mr-8'
              aria-label='Refresh movements'
            >
              <RotateCw
                className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`}
                aria-hidden='true'
              />
              <span className='sr-only'>Refresh</span>
            </Button>
          </div>
          <SheetDescription className='text-xs'>
            {t('inventory.movementsSubtitle')} • {totalElements} logged entries
          </SheetDescription>
        </SheetHeader>

        {/* Movement Entries Stream */}
        <ScrollArea className='flex-1 p-5'>
          {isLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skeleton-movement-${i}`}
                  className='p-4 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-4 w-28' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                  <Skeleton className='h-3 w-44' />
                  <Skeleton className='h-3 w-full' />
                </div>
              ))}
            </div>
          ) : movements.length === 0 ? (
            <div className='h-64 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground'>
              <FileText className='size-8 stroke-[1.5]' aria-hidden='true' />
              <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                {t('inventory.emptyMovements')}
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {movements.map((entry) => (
                <div
                  key={entry.id}
                  className='bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-2.5 transition-colors duration-150'
                >
                  {/* Top Bar: Type Badge, Delta, & Timestamp */}
                  <div className='flex items-center justify-between gap-2 flex-wrap'>
                    <div className='flex items-center gap-2'>
                      {getMovementTypeBadge(entry.movementType)}
                      <span className='text-xs font-semibold text-gray-900 dark:text-gray-100'>
                        {entry.reason}
                      </span>
                    </div>

                    <div className='flex items-center gap-2'>
                      {/* Delta Indicator */}
                      <span
                        className={`font-mono font-bold text-sm tabular-nums px-2 py-0.5 rounded-md ${
                          entry.quantityChange > 0
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : entry.quantityChange < 0
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                              : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {entry.quantityChange > 0
                          ? `+${entry.quantityChange}`
                          : entry.quantityChange}
                      </span>
                    </div>
                  </div>

                  {/* Stock Before -> After Flow */}
                  <div className='flex items-center gap-2 text-xs text-muted-foreground font-mono'>
                    <span>{t('inventory.beforeAfter')}:</span>
                    <span className='tabular-nums text-gray-900 dark:text-gray-100 font-semibold'>
                      {entry.quantityBefore}
                    </span>
                    <ArrowRight className='size-3 text-muted-foreground' aria-hidden='true' />
                    <span className='tabular-nums text-gray-900 dark:text-gray-100 font-semibold'>
                      {entry.quantityAfter}
                    </span>
                  </div>

                  {/* Reference ID & Note (Compact) */}
                  {(entry.referenceId || entry.note) && (
                    <div className='text-xs text-muted-foreground flex flex-wrap items-center gap-2'>
                      {entry.referenceId && (
                        <span className='font-mono bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] text-gray-700 dark:text-gray-300'>
                          Ref: {entry.referenceId}
                        </span>
                      )}
                      {entry.note && (
                        <span className='italic text-muted-foreground text-[11px]'>{entry.note}</span>
                      )}
                    </div>
                  )}

                  {/* Footer: Performed By and Formatted Date */}
                  <div className='flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-gray-100 dark:border-zinc-800/60'>
                    <span className='flex items-center gap-1 truncate max-w-[240px]'>
                      <User className='size-3' aria-hidden='true' />
                      {entry.performedBy || 'SYSTEM'}
                    </span>
                    <span className='tabular-nums'>
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className='p-3 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex items-center justify-between text-xs'>
            <span className='text-muted-foreground'>
              Page {pageNumber} of {totalPages}
            </span>
            <div className='flex items-center gap-1.5'>
              <Button
                variant='outline'
                size='icon'
                disabled={pageNumber <= 1 || isLoading}
                onClick={() => fetchMovements(pageNumber - 1)}
                className='size-7'
                aria-label='Previous page'
              >
                <ChevronLeft className='size-3.5' aria-hidden='true' />
                <span className='sr-only'>Previous</span>
              </Button>
              <Button
                variant='outline'
                size='icon'
                disabled={pageNumber >= totalPages || isLoading}
                onClick={() => fetchMovements(pageNumber + 1)}
                className='size-7'
                aria-label='Next page'
              >
                <ChevronRight className='size-3.5' aria-hidden='true' />
                <span className='sr-only'>Next</span>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
