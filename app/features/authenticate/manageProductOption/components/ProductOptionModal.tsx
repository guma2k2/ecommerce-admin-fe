import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { ProductOptionResponse } from '~/shared/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/core/components/shadcn/dialog'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import { FormInput } from '~/shared/components/Form'
import {
  productOptionFormSchema,
  type ProductOptionFormSchema
} from '../validator'

const COMMON_PRESETS = ['Color', 'Size', 'Material', 'Storage', 'Style']

interface ProductOptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ProductOptionResponse | null
  onSubmit: (values: ProductOptionFormSchema) => Promise<void>
}

export default function ProductOptionModal({
  open,
  onOpenChange,
  initialData,
  onSubmit
}: ProductOptionModalProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(initialData)

  const form = useForm<ProductOptionFormSchema>({
    resolver: zodResolver(productOptionFormSchema),
    defaultValues: {
      name: initialData?.name || ''
    }
  })

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { isSubmitting }
  } = form

  const currentName = watch('name')

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || ''
      })
    }
  }, [open, initialData, reset])

  const handleFormSubmit = async (values: ProductOptionFormSchema) => {
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch {
      // Error handled by mutation toast
    }
  }

  const handleApplyPreset = (preset: string) => {
    setValue('name', preset, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[440px]'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0'>
              <SlidersHorizontal className='size-5' />
            </div>
            <div>
              <DialogTitle className='text-lg font-semibold'>
                {isEditing ? t('productOption.updateTitle') : t('productOption.addTitle')}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                {isEditing
                  ? t('productOption.updateSubtitle', { name: initialData?.name })
                  : t('productOption.addSubtitle')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-5 pt-2'>
          <div className='space-y-4'>
            {/* Option Name Input */}
            <FormInput
              control={control}
              name='name'
              label={t('productOption.name')}
              placeholder={t('productOption.namePlaceholder')}
              disabled={isSubmitting}
            />

            {/* Quick Presets */}
            <div className='space-y-1.5'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-medium'>
                <Sparkles className='size-3.5 text-amber-500' />
                <span>{t('productOption.quickPresets')}</span>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {COMMON_PRESETS.map((preset) => {
                  const isSelected = currentName?.trim().toLowerCase() === preset.toLowerCase()
                  return (
                    <Badge
                      key={preset}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all hover:scale-105 select-none py-1 px-2.5 text-xs font-normal ${
                        isSelected
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400'
                      }`}
                      onClick={() => handleApplyPreset(preset)}
                    >
                      {preset}
                    </Badge>
                  )
                })}
              </div>
              <p className='text-[11px] text-muted-foreground/80'>
                {t('productOption.presetHint')}
              </p>
            </div>
          </div>

          {/* Dialog Footer Actions */}
          <DialogFooter className='gap-2 sm:gap-0 pt-2 border-t border-gray-100 dark:border-zinc-800'>
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
              disabled={isSubmitting}
              className='gap-2 bg-indigo-600 hover:bg-indigo-700 text-white'
            >
              {isSubmitting && <Loader2 className='size-4 animate-spin' />}
              {isEditing ? t('productOption.updateOption') : t('productOption.createOption')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
