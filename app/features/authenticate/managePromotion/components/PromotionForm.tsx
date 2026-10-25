import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Loader2, Sparkles } from "lucide-react"
import { FormCheckbox, FormInput, FormTextarea } from "~/shared/components/Form"
import { Button } from "~/core/components/shadcn/button"
import { generateSlug } from "~/shared/utils/appUtils"
import { promotionFormSchema, type PromotionFormData } from "../validator"
import PromotionTargetCard from "./PromotionTargetCard"
import type { CreatePromotionRequest } from "~/shared/types"

export interface PromotionFormProps {
  defaultValues?: Partial<PromotionFormData>
  onSubmit: (values: CreatePromotionRequest) => void | Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  isEdit?: boolean
}

export default function PromotionForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
  isEdit = false
}: PromotionFormProps) {
  const { t } = useTranslation()

  // Format date helper for datetime-local inputs
  const toLocalInputDate = (isoStr?: string | null) => {
    if (!isoStr) return ""
    try {
      const d = new Date(isoStr)
      if (isNaN(d.getTime())) return ""
      // Format YYYY-MM-DDTHH:mm in local time
      const offset = d.getTimezoneOffset() * 60000
      return new Date(d.getTime() - offset).toISOString().slice(0, 16)
    } catch {
      return ""
    }
  }

  const defaultStart = defaultValues?.startDate
    ? toLocalInputDate(defaultValues.startDate)
    : toLocalInputDate(new Date().toISOString())

  const defaultEnd = defaultValues?.endDate
    ? toLocalInputDate(defaultValues.endDate)
    : toLocalInputDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      slug: defaultValues?.slug || "",
      couponCode: defaultValues?.couponCode || "",
      description: defaultValues?.description || "",
      discountType: defaultValues?.discountType || "PERCENTAGE",
      usageType: defaultValues?.usageType || "LIMITED",
      applyTo: defaultValues?.applyTo || "ORDER",
      usageLimit: defaultValues?.usageLimit ?? 100,
      usageLimitPerCustomer: defaultValues?.usageLimitPerCustomer ?? 1,
      discountPercentage: defaultValues?.discountPercentage ?? 10,
      discountAmount: defaultValues?.discountAmount ?? 10,
      maxDiscountAmount: defaultValues?.maxDiscountAmount ?? null,
      minimumOrderPurchaseAmount: defaultValues?.minimumOrderPurchaseAmount ?? null,
      isActive: defaultValues?.isActive ?? true,
      startDate: defaultStart,
      endDate: defaultEnd,
      targetProductIds: defaultValues?.targetProductIds || [],
      targetCategoryIds: defaultValues?.targetCategoryIds || [],
      targetBrandIds: defaultValues?.targetBrandIds || []
    }
  })

  const { control, handleSubmit, watch, setValue } = form

  const discountType = watch("discountType")
  const usageType = watch("usageType")

  const handleGenerateSlug = () => {
    const name = form.getValues("name")
    if (name) {
      setValue("slug", generateSlug(name), { shouldValidate: true })
    }
  }

  const handleFormSubmit = (data: PromotionFormData) => {
    const payload: CreatePromotionRequest = {
      name: data.name.trim(),
      slug: data.slug.trim(),
      couponCode: data.couponCode.trim().toUpperCase(),
      description: data.description?.trim() || null,
      discountType: data.discountType,
      usageType: data.usageType,
      applyTo: data.applyTo,
      usageLimit: data.usageType === "LIMITED" ? Number(data.usageLimit) : null,
      usageLimitPerCustomer: Number(data.usageLimitPerCustomer) || 1,
      discountPercentage:
        data.discountType === "PERCENTAGE" && data.discountPercentage != null ? Number(data.discountPercentage) : null,
      discountAmount: data.discountType === "FIXED" && data.discountAmount != null ? Number(data.discountAmount) : null,
      maxDiscountAmount: data.maxDiscountAmount != null ? Number(data.maxDiscountAmount) : null,
      minimumOrderPurchaseAmount:
        data.minimumOrderPurchaseAmount != null ? Number(data.minimumOrderPurchaseAmount) : null,
      isActive: data.isActive ?? true,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      targetProductIds: data.applyTo === "PRODUCT" ? data.targetProductIds || [] : [],
      targetCategoryIds: data.applyTo === "CATEGORY" ? data.targetCategoryIds || [] : [],
      targetBrandIds: data.applyTo === "BRAND" ? data.targetBrandIds || [] : []
    }

    return onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      {/* Top Header Actions */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold tracking-tight text-foreground'>
          {isEdit ? t("promotion.editTitle", "Edit Promotion") : t("promotion.createTitle", "Create Promotion")}
        </h2>
        <div className='flex items-center gap-2'>
          {onCancel && (
            <Button type='button' variant='outline' size='sm' onClick={onCancel} disabled={isSubmitting}>
              {t("button.cancel", "Cancel")}
            </Button>
          )}
          <Button type='submit' size='sm' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='size-4 animate-spin mr-1.5' />}
            {isEdit ? t("button.saveChanges", "Save Changes") : t("button.create", "Create")}
          </Button>
        </div>
      </div>

      {/* Card 1: General Info */}
      <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-5 space-y-4'>
        <h3 className='text-base font-semibold text-foreground'>{t("promotion.generalInfo", "General Information")}</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={control}
            name='name'
            label={t("promotion.name", "Promotion Name")}
            placeholder='e.g. Summer Festival 2026'
          />

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium leading-none text-foreground'>{t("promotion.slug", "Slug")}</span>
              <Button
                type='button'
                variant='ghost'
                size='xs'
                onClick={handleGenerateSlug}
                className='text-xs h-6 px-1.5 gap-1 text-primary'
              >
                <Sparkles className='size-3' />
                {t("button.generate", "Generate")}
              </Button>
            </div>
            <FormInput control={control} name='slug' placeholder='summer-festival-2026' />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={control}
            name='couponCode'
            label={t("promotion.couponCode", "Coupon Code")}
            placeholder='SUMMER20'
            onChange={(e) => {
              setValue("couponCode", e.target.value.toUpperCase())
            }}
          />

          <div className='flex items-center pt-6'>
            <FormCheckbox control={control} name='isActive' label={t("status.active", "Active")} />
          </div>
        </div>

        <FormTextarea
          control={control}
          name='description'
          label={t("promotion.description", "Description")}
          placeholder='Campaign notes...'
          rows={2}
        />
      </div>

      {/* Card 2: Discount Value */}
      <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-5 space-y-4'>
        <h3 className='text-base font-semibold text-foreground'>
          {t("promotion.discountConfig", "Discount Configuration")}
        </h3>

        <div className='space-y-2'>
          <span className='text-sm font-medium leading-none text-foreground'>
            {t("promotion.discountType", "Discount Type")}
          </span>
          <div className='grid grid-cols-2 gap-2 max-w-xs'>
            <Button
              type='button'
              size='sm'
              variant={discountType === "PERCENTAGE" ? "default" : "outline"}
              onClick={() => setValue("discountType", "PERCENTAGE", { shouldValidate: true })}
            >
              {t("promotion.percentage", "Percentage (%)")}
            </Button>
            <Button
              type='button'
              size='sm'
              variant={discountType === "FIXED" ? "default" : "outline"}
              onClick={() => setValue("discountType", "FIXED", { shouldValidate: true })}
            >
              {t("promotion.fixed", "Fixed Amount ($)")}
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {discountType === "PERCENTAGE" ? (
            <>
              <FormInput
                control={control}
                name='discountPercentage'
                label={t("promotion.percentageValue", "Discount Percentage (%)")}
                type='number'
                step='0.1'
                min='0.01'
                max='100'
                placeholder='20'
              />
              <FormInput
                control={control}
                name='maxDiscountAmount'
                label={t("promotion.maxDiscountAmount", "Max Discount Cap ($)")}
                type='number'
                step='0.01'
                placeholder='50.00'
              />
            </>
          ) : (
            <FormInput
              control={control}
              name='discountAmount'
              label={t("promotion.discountAmount", "Discount Amount ($)")}
              type='number'
              step='0.01'
              min='0.01'
              placeholder='15.00'
            />
          )}

          <FormInput
            control={control}
            name='minimumOrderPurchaseAmount'
            label={t("promotion.minPurchase", "Minimum Purchase ($)")}
            type='number'
            step='0.01'
            placeholder='75.00'
          />
        </div>
      </div>

      {/* Card 3: Usage Limits & Schedule */}
      <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-5 space-y-4'>
        <h3 className='text-base font-semibold text-foreground'>{t("promotion.usageSchedule", "Usage & Schedule")}</h3>

        <div className='space-y-2'>
          <span className='text-sm font-medium leading-none text-foreground'>
            {t("promotion.usageType", "Usage Limit Type")}
          </span>
          <div className='grid grid-cols-2 gap-2 max-w-xs'>
            <Button
              type='button'
              size='sm'
              variant={usageType === "LIMITED" ? "default" : "outline"}
              onClick={() => setValue("usageType", "LIMITED", { shouldValidate: true })}
            >
              {t("promotion.limited", "Limited Count")}
            </Button>
            <Button
              type='button'
              size='sm'
              variant={usageType === "UNLIMITED" ? "default" : "outline"}
              onClick={() => setValue("usageType", "UNLIMITED", { shouldValidate: true })}
            >
              {t("promotion.unlimited", "Unlimited")}
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {usageType === "LIMITED" && (
            <FormInput
              control={control}
              name='usageLimit'
              label={t("promotion.usageLimit", "Total Limit")}
              type='number'
              min='1'
              placeholder='500'
            />
          )}

          <FormInput
            control={control}
            name='usageLimitPerCustomer'
            label={t("promotion.limitPerCustomer", "Limit Per Customer")}
            type='number'
            min='1'
            placeholder='1'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={control}
            name='startDate'
            label={t("promotion.startDate", "Start Date & Time")}
            type='datetime-local'
          />

          <FormInput
            control={control}
            name='endDate'
            label={t("promotion.endDate", "End Date & Time")}
            type='datetime-local'
          />
        </div>
      </div>

      {/* Card 4: Target Application Scope */}
      <PromotionTargetCard form={form} />
    </form>
  )
}
