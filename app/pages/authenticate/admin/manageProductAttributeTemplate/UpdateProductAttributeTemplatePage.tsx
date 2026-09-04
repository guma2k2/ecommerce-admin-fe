import { useState } from 'react'
import { useLoaderData, useNavigate, Link } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import ProductAttributeTemplateForm from '~/features/authenticate/manageProductAttributeTemplate/components/ProductAttributeTemplateForm'
import type { ProductAttributeTemplateFormSchema } from '~/features/authenticate/manageProductAttributeTemplate/validator'
import {
  getProductAttributeTemplateById,
  updateProductAttributeTemplate
} from '~/shared/services/api/productAttributeTemplateService'
import { showToast } from '~/shared/utils/toast'
import { Button } from '~/core/components/shadcn/button'

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const templateId = params.id
  if (!templateId) {
    throw new Error('Product Attribute Template ID is required')
  }
  const template = await getProductAttributeTemplateById(templateId)
  return { template }
}

clientLoader.hydrate = true as const

export default function UpdateProductAttributeTemplatePage() {
  const { t } = useTranslation()
  const { template } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (values: ProductAttributeTemplateFormSchema) => {
    try {
      setIsSubmitting(true)
      await updateProductAttributeTemplate(template.id, {
        name: values.name,
        attributeIds: values.attributeIds.map(Number).filter((n) => !isNaN(n))
      })
      navigate('/admin/manage-product-attribute-template')
    } catch (error: any) {
      console.error('Update product attribute template error:', error)
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
            <Pencil className='size-6 text-indigo-500' />
            {t('productAttributeTemplate.updateTitle')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('productAttributeTemplate.updateSubtitle', { id: template.id, name: template.name })}
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-3xl bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs p-6'>
        <ProductAttributeTemplateForm
          defaultValues={{
            name: template.name,
            attributeIds:
              template.attributeIds?.map(String) ||
              template.attributes?.map((a) => String(a.id)) ||
              []
          }}
          initialAttributes={
            template.attributes?.map((a) => ({
              ...a,
              id: String(a.id)
            })) || []
          }
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/admin/manage-product-attribute-template')}
          submitLabel={t('productAttributeTemplate.updateTemplate')}
        />
      </div>
    </div>
  )
}
