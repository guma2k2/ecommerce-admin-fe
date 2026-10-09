import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  PackageCheck,
  SlidersHorizontal
} from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  SelectItem
} from '~/core/components/shadcn'
import { FormInput, FormSelect } from '~/shared/components'
import {
  stockAdjustmentSchema,
  type StockAdjustmentFormValues
} from '~/features/authenticate/manageInventory/validator'
import type { InventoryItem, StockAdjustmentPayload, StockAdjustmentReason } from '~/shared/types'

interface StockAdjustModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem | null
  onSubmit: (payload: StockAdjustmentPayload) => Promise<void>
}

const REASON_OPTIONS: StockAdjustmentReason[] = ['RESTOCK', 'CORRECTION']

export default function StockAdjustModal({
  open,
  onOpenChange,
  item,
  onSubmit
}: StockAdjustModalProps) {
  const { t } = useTranslation()

  const form = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      productVariantId: item?.productVariantId ?? 0,
      reason: 'RESTOCK',
      quantityChange: 1
    }
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting }
  } = form

  const productVariantId = item?.productVariantId

  // Synchronize form values whenever modal opens for an item
  useEffect(() => {
    if (open && productVariantId) {
      reset({
        productVariantId,
        reason: 'RESTOCK',
        quantityChange: 1
      })
    }
  }, [open, productVariantId, reset])

  // Derive projected metrics directly during render
  const currentOnHand = item?.onHand ?? 0
  const currentReserved = item?.reserved ?? 0
  const watchedDelta = watch('quantityChange')
  const delta = Number.isNaN(Number(watchedDelta)) ? 0 : Number(watchedDelta)

  const projectedOnHand = currentOnHand + delta
  const projectedAvailable = projectedOnHand - currentReserved
  const isViolatingHolds = projectedOnHand < currentReserved
  const isBelowZero = projectedOnHand < 0
  const hasSafetyError = isViolatingHolds || isBelowZero

  const handleFormSubmit = async (values: StockAdjustmentFormValues) => {
    if (hasSafetyError) return
    await onSubmit({
      productVariantId: values.productVariantId,
      quantityChange: Number(values.quantityChange),
      reason: values.reason
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open && Boolean(item)} onOpenChange={onOpenChange}>
      {item && (
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <div className='flex items-center gap-2 text-primary'>
              <SlidersHorizontal className='size-5' aria-hidden='true' />
              <DialogTitle>
                {t('inventory.adjustTitle', { sku: item.sku })}
              </DialogTitle>
            </div>
            <DialogDescription>
              {t('inventory.adjustSubtitle')}
            </DialogDescription>
          </DialogHeader>

          {/* Current vs Projected Stock Preview Card */}
          <div className='bg-gray-50/80 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 rounded-lg p-3.5 space-y-2.5'>
            <div className='grid grid-cols-3 gap-2 text-center text-xs'>
              <div>
                <span className='text-muted-foreground block'>{t('inventory.onHand')}</span>
                <span className='font-bold text-sm tabular-nums text-gray-900 dark:text-gray-100'>
                  {currentOnHand}
                </span>
              </div>
              <div>
                <span className='text-muted-foreground block'>{t('inventory.reserved')}</span>
                <span className='font-bold text-sm tabular-nums text-amber-600 dark:text-amber-400'>
                  {currentReserved}
                </span>
              </div>
              <div>
                <span className='text-muted-foreground block'>{t('inventory.available')}</span>
                <span className='font-bold text-sm tabular-nums text-gray-900 dark:text-gray-100'>
                  {item.available}
                </span>
              </div>
            </div>

            <div className='border-t border-gray-200 dark:border-zinc-800 pt-2 flex flex-wrap items-center justify-between gap-2 text-xs'>
              <span className='font-medium text-muted-foreground flex items-center gap-1.5'>
                <ArrowRight className='size-3.5 text-primary' aria-hidden='true' />
                {t('inventory.projectedMetrics')}:
              </span>
              <div className='flex items-center gap-4 tabular-nums font-semibold'>
                <span>
                  {t('inventory.onHand')}:{' '}
                  <span className={projectedOnHand < 0 ? 'text-destructive' : 'text-primary'}>
                    {projectedOnHand}
                  </span>
                </span>
                <span>
                  {t('inventory.available')}:{' '}
                  <span className={projectedAvailable < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}>
                    {projectedAvailable}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Safety Warning Banner if violating holds or dropping below zero */}
          {hasSafetyError && (
            <div
              className='bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex items-start gap-2.5 text-xs'
              role='alert'
              aria-live='polite'
            >
              <AlertCircle className='size-4 shrink-0 mt-0.5' aria-hidden='true' />
              <div>
                {isBelowZero ? (
                  <p>{t('inventory.negativeOnHandError')}</p>
                ) : (
                  <p>{t('inventory.violatingHoldsError', { reserved: currentReserved })}</p>
                )}
              </div>
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
            {/* Reason Selection */}
            <FormSelect
              control={control}
              name='reason'
              label={
                <span>
                  {t('inventory.reason')} <span className='text-destructive'>*</span>
                </span>
              }
              placeholder={t('inventory.reason')}
              disabled={isSubmitting}
            >
              {REASON_OPTIONS.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {t(`inventory.reasons.${reason}`)}
                </SelectItem>
              ))}
            </FormSelect>

            {/* Quantity Change Input */}
            <FormInput
              control={control}
              name='quantityChange'
              type='number'
              step='1'
              className='h-9 tabular-nums font-mono'
              label={
                <span>
                  {t('inventory.quantityChange')} <span className='text-destructive'>*</span>
                </span>
              }
              disabled={isSubmitting}
            />

            {/* Footer actions */}
            <DialogFooter className='pt-2 gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('button.cancel')}
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting || hasSafetyError}
                className='gap-1.5'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='size-3.5 animate-spin' aria-hidden='true' />
                    <span>{t('inventory.submitting')}</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className='size-3.5' aria-hidden='true' />
                    <span>{t('button.confirm')}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  )
}
