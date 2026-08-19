import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FormInput } from '~/shared/components/Form'
import { Button } from '~/core/components/shadcn/button'
import { FieldGroup } from '~/core/components/shadcn/field'
import {
  productAttributeTemplateFormSchema,
  type ProductAttributeTemplateFormSchema
} from '../validator'

interface ProductAttributeTemplateFormProps {
  defaultValues?: Partial<ProductAttributeTemplateFormSchema>
  onSubmit: (values: ProductAttributeTemplateFormSchema) => void | Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  submitLabel?: string
}

export default function ProductAttributeTemplateForm({
  defaultValues = { name: '' },
  onSubmit,
  isSubmitting = false,
  onCancel,
  submitLabel
}: ProductAttributeTemplateFormProps) {
  const { t } = useTranslation()

  const form = useForm<ProductAttributeTemplateFormSchema>({
    resolver: zodResolver(productAttributeTemplateFormSchema),
    defaultValues: {
      name: defaultValues.name || ''
    }
  })

  const { handleSubmit, control } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <FieldGroup className='space-y-5'>
        {/* Template Name Field */}
        <FormInput
          control={control}
          name='name'
          label={t('productAttributeTemplate.name')}
          placeholder={t('productAttributeTemplate.namePlaceholder')}
          disabled={isSubmitting}
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
              <Loader2 className='size-4 animate-spin' /> {t('productAttributeTemplate.saving')}
            </>
          ) : (
            submitLabel || t('productAttributeTemplate.saveTemplate')
          )}
        </Button>
      </div>
    </form>
  )
}
