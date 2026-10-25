import { useState } from "react"
import { useNavigate, Link } from "react-router"
import { ArrowLeft, Tag } from "lucide-react"
import { useTranslation } from "react-i18next"

import { PromotionForm } from "~/features/authenticate/managePromotion"
import { createPromotion } from "~/shared/services/api/promotionService"
import type { CreatePromotionRequest } from "~/shared/types"
import { Button } from "~/core/components/shadcn/button"

export default function CreatePromotionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (payload: CreatePromotionRequest) => {
    try {
      setIsSubmitting(true)
      const res = await createPromotion(payload)
      if (res?.id) {
        navigate(`/admin/manage-promotion/edit/${res.id}`)
      } else {
        navigate("/admin/manage-promotion")
      }
    } catch (error) {
      console.error("Create promotion error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Header section */}
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' asChild className='bg-white dark:bg-zinc-900 shadow-xs'>
          <Link to='/admin/manage-promotion'>
            <ArrowLeft className='size-4' />
            <span className='sr-only'>{t("button.back", "Back")}</span>
          </Link>
        </Button>
        <div className='flex items-center gap-2'>
          <Tag className='size-6 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            {t("promotion.addPromotion", "Add Promotion")}
          </h1>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-4xl'>
        <PromotionForm
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/admin/manage-promotion")}
        />
      </div>
    </div>
  )
}
