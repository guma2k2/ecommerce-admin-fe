import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router"
import { ArrowLeft, Save, Loader2, PackagePlus, Edit3 } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"
import { cn } from "~/shared/utils"
import type { ProductResponse } from "~/shared/types"

export interface ProductActionHeaderProps {
  mode: "create" | "edit"
  initialData?: ProductResponse | null
  productName?: string
  productId?: number | string
  isDirty?: boolean
  isSubmitting?: boolean
  onSave?: () => void | Promise<void>
  onDiscard?: () => void
  backUrl?: string
  className?: string
}

export default function ProductActionHeader({
  mode,
  initialData,
  productName,
  productId,
  isDirty = false,
  isSubmitting = false,
  onSave,
  onDiscard,
  backUrl = "/admin/manage-product",
  className
}: ProductActionHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const displayName = productName || initialData?.name || ""
  const displayId = productId ?? initialData?.id

  const handleDiscard = () => {
    if (onDiscard) {
      onDiscard()
    } else {
      navigate(backUrl)
    }
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-40 -mx-6 -mt-6 px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 shadow-2xs",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          asChild
          className="h-9 w-9 bg-white dark:bg-zinc-900 shadow-xs border-gray-200 dark:border-zinc-800"
        >
          <Link to={backUrl}>
            <ArrowLeft className="size-4" />
            <span className="sr-only">{t("product.backToProducts")}</span>
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2">
              {mode === "create" ? (
                <>
                  <PackagePlus className="size-5 text-primary" />
                  {t("product.addNew")}
                </>
              ) : (
                <>
                  <Edit3 className="size-5 text-primary" />
                  {t("product.updateTitle")}
                  {displayName ? `: ${displayName}` : ""}
                </>
              )}
            </h1>
            {mode === "edit" && displayId && (
              <Badge variant="secondary" className="font-mono text-xs">
                #{displayId}
              </Badge>
            )}
            {isDirty && (
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                {t("product.unsavedChanges")}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {mode === "create"
              ? t("product.addSubtitle")
              : t("product.updateSubtitle")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDiscard}
          className="h-9 px-4 text-xs font-medium border-gray-300 dark:border-zinc-700"
        >
          {t("product.discard")}
        </Button>

        <Button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          size="sm"
          className="h-9 px-5 text-xs font-medium gap-1.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-xs cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              {t("product.saving")}
            </>
          ) : (
            <>
              <Save className="size-3.5" />
              {mode === "create" ? t("product.saveProduct") : t("product.saveChanges")}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
