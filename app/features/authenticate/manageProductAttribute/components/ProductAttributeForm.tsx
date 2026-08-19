import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FormInput } from '~/shared/components/Form'
import { Button } from '~/core/components/shadcn/button'
import { FieldGroup } from '~/core/components/shadcn/field'
import {
  productAttributeFormSchema,
  type ProductAttributeFormSchema
} from '../validator'

interface ProductAttributeFormProps {
  defaultValues?: Partial<ProductAttributeFormSchema>
  onSubmit: (values: ProductAttributeFormSchema) => void | Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  submitLabel?: string
}

export default function ProductAttributeForm({
  defaultValues = { name: '' },
  onSubmit,
  isSubmitting = false,
  onCancel,
  submitLabel
}: ProductAttributeFormProps) {
  const { t } = useTranslation()

  const form = useForm<ProductAttributeFormSchema>({
    resolver: zodResolver(productAttributeFormSchema),
    defaultValues: {
      name: defaultValues.name || ''
    }
  })

  const { handleSubmit, control } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <FieldGroup className='space-y-5'>
        {/* Attribute Name Field */}
        <FormInput
          control={control}
          name='name'
          label={t('productAttribute.name')}
          placeholder={t('productAttribute.namePlaceholder')}
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
              <Loader2 className='size-4 animate-spin' /> {t('productAttribute.saving')}
            </>
          ) : (
            submitLabel || t('productAttribute.saveAttribute')
          )}
        </Button>
      </div>
    </form>
  )
}
