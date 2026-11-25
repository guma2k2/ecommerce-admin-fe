import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useFormContext, useWatch } from "react-hook-form"
import { Lock, Unlock, Sparkles } from "lucide-react"
import { FormInput, FormTextEditor } from "~/shared/components/Form"
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Label
} from "~/core/components/shadcn"
import { generateSlug } from "~/shared/utils"
import type { ProductFormSchema } from "~/features/authenticate/manageProduct/validator"

export default function ProductGeneralInfoCard() {
  const { t } = useTranslation()
  const { control, setValue, getValues } = useFormContext<ProductFormSchema>()
  const [isSlugLocked, setIsSlugLocked] = useState(true)
  const name = useWatch({ control, name: "name" })
  const slug = useWatch({ control, name: "slug" })

  // Auto-generate slug when title changes if slug is locked or empty
  useEffect(() => {
    if (isSlugLocked && name) {
      const autoSlug = generateSlug(name)
      setValue("slug", autoSlug, { shouldValidate: true, shouldDirty: true })
    }
  }, [name, isSlugLocked, setValue])

  const handleManualRegenerate = () => {
    const currentName = getValues("name") || ""
    const autoSlug = generateSlug(currentName)
    setValue("slug", autoSlug, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("product.basicInfo.title")}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* Product Title / Name */}
        <div>
          <FormInput
            control={control}
            name="name"
            label={t("product.basicInfo.productTitleLabel")}
            placeholder={t("product.basicInfo.productTitlePlaceholder")}
            className="text-base font-medium"
          />
        </div>

        {/* URL Slug Generator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label variant="field">
              {t("product.basicInfo.slugLabel")}
              {isSlugLocked && (
                <span className="text-xs text-muted-foreground font-normal">
                  {t("product.basicInfo.slugAutoSynced")}
                </span>
              )}
            </Label>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleManualRegenerate}
                className="h-6 px-2 text-xs text-primary gap-1"
              >
                <Sparkles className="size-3" />
                {t("product.basicInfo.regenerate")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSlugLocked((prev) => !prev)}
                className="h-6 px-2 text-xs text-muted-foreground gap-1"
                title={isSlugLocked ? t("product.basicInfo.unlockTooltip") : t("product.basicInfo.lockTooltip")}
              >
                {isSlugLocked ? (
                  <>
                    <Lock className="size-3 text-amber-500" />
                    {t("product.basicInfo.locked")}
                  </>
                ) : (
                  <>
                    <Unlock className="size-3 text-emerald-500" />
                    {t("product.basicInfo.custom")}
                  </>
                )}
              </Button>
            </div>
          </div>

          <InputGroup className="h-auto rounded-lg border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/40 py-1.5 shadow-none">
            <InputGroupAddon align="inline-start" className="py-0 pr-1">
              <InputGroupText className="text-xs text-gray-400">
                https://store.com/products/
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              value={slug || ""}
              disabled={isSlugLocked}
              onChange={(e) => {
                setValue("slug", generateSlug(e.target.value), {
                  shouldValidate: true,
                  shouldDirty: true
                })
              }}
              placeholder={t("product.basicInfo.slugPlaceholder")}
              className="h-auto py-0 pl-0 text-xs md:text-xs font-mono text-gray-800 dark:text-gray-200"
            />
          </InputGroup>
        </div>

        {/* Product Description */}
        <FormTextEditor
          control={control}
          name="description"
          label={t("product.basicInfo.descriptionLabel")}
          placeholder={t("product.basicInfo.descriptionPlaceholder")}
        />
      </div>
    </div>
  )
}
