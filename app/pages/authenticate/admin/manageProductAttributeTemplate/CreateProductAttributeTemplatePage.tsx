import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import ProductAttributeTemplateForm from '~/features/authenticate/manageProductAttributeTemplate/components/ProductAttributeTemplateForm'
import type { ProductAttributeTemplateFormSchema } from '~/features/authenticate/manageProductAttributeTemplate/validator'
import { createProductAttributeTemplate } from '~/shared/services/api/productAttributeTemplateService'
import { showToast } from '~/shared/utils/toast'
import { Button } from '~/core/components/shadcn/button'

export default function CreateProductAttributeTemplatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (values: ProductAttributeTemplateFormSchema) => {
    try {
      setIsSubmitting(true)
      await createProductAttributeTemplate({
        name: values.name,
        attribute_ids: values.attribute_ids
      })
      showToast('success', 'toasts.attributeTemplateCreated')
      navigate('/admin/manage-product-attribute-template')
    } catch (error: any) {
      console.error('Create product attribute template error:', error)
      const errorMsg = error?.response?.data?.message || 'toasts.error'
      showToast('error', errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Header section */}
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' asChild className='bg-white dark:bg-zinc-900 shadow-xs'>
          <Link to='/admin/manage-product-attribute-template'>
            <ArrowLeft className='size-4' />
            <span className='sr-only'>{t('productAttributeTemplate.backToTemplates')}</span>
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2'>
            <SlidersHorizontal className='size-6 text-indigo-500' />
            {t('productAttributeTemplate.addNew')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('productAttributeTemplate.addSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-3xl bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs p-6'>
        <ProductAttributeTemplateForm
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/admin/manage-product-attribute-template')}
          submitLabel={t('productAttributeTemplate.createTemplate')}
        />
      </div>
    </div>
  )
}
