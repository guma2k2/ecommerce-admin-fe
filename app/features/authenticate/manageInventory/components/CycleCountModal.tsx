import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/core/components/shadcn'
import { FormInput } from '~/shared/components'
import {
  cycleCountSchema,
  type CycleCountFormValues
} from '~/features/authenticate/manageInventory/validator'
import type { CycleCountPayload, InventoryItem } from '~/shared/types'

interface CycleCountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem | null
  onSubmit: (payload: CycleCountPayload) => Promise<void>
}

export default function CycleCountModal({
  open,
  onOpenChange,
  item,
  onSubmit
}: CycleCountModalProps) {
  const { t } = useTranslation()

  const form = useForm<CycleCountFormValues>({
    resolver: zodResolver(cycleCountSchema),
    defaultValues: {
      productVariantId: item?.productVariantId ?? 0,
      physicalCount: item?.onHand ?? 0
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
  const initialOnHand = item?.onHand
 
  // Synchronize form values whenever modal opens for an item
  useEffect(() => {
    if (open && productVariantId !== undefined) {
      reset({
        productVariantId,
        physicalCount: initialOnHand ?? 0
      })
    }
  }, [open, productVariantId, initialOnHand, reset])

  // Derive reconciliation metrics during render
  const currentOnHand = item?.onHand ?? 0
  const currentReserved = item?.reserved ?? 0
  const watchedPhysical = watch('physicalCount')
  const physicalCount = Number.isNaN(Number(watchedPhysical)) ? 0 : Number(watchedPhysical)

  const delta = physicalCount - currentOnHand
  const isBelowReserved = physicalCount < currentReserved
  const isNegative = physicalCount < 0
  const hasSafetyError = isBelowReserved || isNegative

  const handleFormSubmit = async (values: CycleCountFormValues) => {
    if (hasSafetyError) return
    await onSubmit({
      productVariantId: values.productVariantId,
      physicalCount: Number(values.physicalCount),
      referenceId: `AUDIT-${Date.now()}`
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open && Boolean(item)} onOpenChange={onOpenChange}>
      {item && (
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <div className='flex items-center gap-2 text-emerald-600 dark:text-emerald-400'>
              <ClipboardCheck className='size-5' aria-hidden='true' />
              <DialogTitle>
                {t('inventory.cycleCountTitle', { sku: item.sku })}
              </DialogTitle>
            </div>
            <DialogDescription>
              {t('inventory.cycleCountSubtitle')}
            </DialogDescription>
          </DialogHeader>

          {/* Current Metrics & Computed Delta Reconciliation Card */}
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

            <div className='border-t border-gray-200 dark:border-zinc-800 pt-2 flex items-center justify-between text-xs'>
              <span className='font-medium text-muted-foreground flex items-center gap-1.5'>
                <ArrowRight className='size-3.5 text-emerald-600' aria-hidden='true' />
                {t('inventory.calculatedDelta')}:
              </span>
              <span
                className={`font-mono font-bold text-sm tabular-nums ${
                  delta > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : delta < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-muted-foreground'
                }`}
              >
                {delta > 0 ? `+${delta}` : delta} units
              </span>
            </div>
          </div>

          {/* Error alert if below holds or negative */}
          {hasSafetyError && (
            <div
              className='bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex items-start gap-2.5 text-xs'
              role='alert'
              aria-live='polite'
            >
              <AlertCircle className='size-4 shrink-0 mt-0.5' aria-hidden='true' />
              <div>
                {isNegative ? (
                  <p>{t('inventory.negativeOnHandError')}</p>
                ) : (
                  <p>{t('inventory.violatingHoldsError', { reserved: currentReserved })}</p>
                )}
              </div>
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
            {/* Physical Count Input */}
            <FormInput
              control={control}
              name='physicalCount'
              type='number'
              min='0'
              step='1'
              className='h-9 tabular-nums font-mono font-semibold text-base'
              label={
                <span>
                  {t('inventory.physicalCount')} <span className='text-destructive'>*</span>
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
                className='gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='size-3.5 animate-spin' aria-hidden='true' />
                    <span>{t('inventory.reconciling')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className='size-3.5' aria-hidden='true' />
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
