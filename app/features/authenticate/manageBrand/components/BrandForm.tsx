import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FormInput, FormUpload } from '~/shared/components/Form'
import { Button } from '~/core/components/shadcn/button'
import { FieldGroup } from '~/core/components/shadcn/field'
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

  const { handleSubmit, control } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <FieldGroup className='space-y-5'>
        {/* Brand Name Field */}
        <FormInput
          control={control}
          name='name'
          label={t('brand.name')}
          placeholder={t('brand.namePlaceholder')}
          disabled={isSubmitting}
        />

        {/* Brand Logo Upload Field */}
        <FormUpload
          control={control}
          name='image'
          label={t('brand.uploadLogo')}
          placeholderText={t('brand.uploadPrompt')}
          hintText={t('brand.uploadHint')}
          disabled={isSubmitting}
          mediaDialog
        />
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
