import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FormInput } from '~/shared/components/Form'
import { Button } from '~/core/components/shadcn/button'
import { FieldContent, FieldGroup, FieldLabel } from '~/core/components/shadcn/field'
import { brandFormSchema, type BrandFormSchema } from '../validator'

interface BrandFormProps {
  defaultValues?: Partial<BrandFormSchema>
  onSubmit: (values: BrandFormSchema) => void | Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  submitLabel?: string
}

export default function BrandForm({
  defaultValues = { name: '', image: '' },
  onSubmit,
  isSubmitting = false,
  onCancel,
  submitLabel
}: BrandFormProps) {
  const { t } = useTranslation()

  const form = useForm<BrandFormSchema>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: defaultValues.name || '',
      image: defaultValues.image || ''
    }
  })

  const { handleSubmit, control, watch } = form
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false)
  const imageUrl = watch('image')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <FieldGroup className='space-y-4'>
        {/* Brand Name Field */}
        <FormInput
          control={control}
          name='name'
          label={t('brand.name')}
          placeholder={t('brand.namePlaceholder')}
          disabled={isSubmitting}
        />

        {/* Brand Image URL Field */}
        <FormInput
          control={control}
          name='image'
          label={t('brand.imageUrl')}
          placeholder={t('brand.imagePlaceholder')}
          disabled={isSubmitting}
        />

        {/* Image Preview Canvas */}
        <FieldContent className='space-y-1.5'>
          <FieldLabel>{t('brand.logoPreview')}</FieldLabel>
          <div className='w-full h-32 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-center p-2 relative overflow-hidden'>
            {imageUrl && !imagePreviewFailed ? (
              <img
                src={imageUrl}
                alt={t('brand.logoPreview')}
                onError={() => setImagePreviewFailed(true)}
                className='max-h-28 max-w-full object-contain rounded-md'
              />
            ) : (
              <div className='flex flex-col items-center justify-center text-muted-foreground gap-1.5 text-xs'>
                <ImageIcon className='size-8 text-gray-400' />
                <span>{imageUrl ? t('brand.failedToLoadPreview') : t('brand.enterUrlToPreview')}</span>
              </div>
            )}
          </div>
        </FieldContent>
      </FieldGroup>

      {/* Form Action Buttons */}
      <div className='flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800'>
        {onCancel && (
          <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
            {t('button.cancel')}
          </Button>
        )}
        <Button type='submit' disabled={isSubmitting} className='gap-2'>
          {isSubmitting ? (
            <>
              <Loader2 className='size-4 animate-spin' /> {t('brand.saving')}
            </>
          ) : (
            submitLabel || t('brand.saveBrand')
          )}
        </Button>
      </div>
    </form>
  )
}
