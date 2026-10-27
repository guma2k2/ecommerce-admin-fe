import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Calendar,
  Check,
  Copy,
  DollarSign,
  Edit2,
  FolderTree,
  Infinity,
  Package,
  Percent,
  ShoppingCart,
  Tag,
  Ticket,
  Trash2,
  Award
} from "lucide-react"

import type { PromotionListItem } from "~/shared/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/core/components/shadcn/table"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"
import { Progress } from "~/core/components/shadcn/progress"
import { Skeleton } from "~/core/components/shadcn/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/core/components/shadcn/tooltip"
import { cn, formatDateRange, getPromotionTimeStatus } from "~/shared/utils/appUtils"
import { showToast } from "~/shared/utils/toast"

export interface PromotionTableProps {
  promotions: PromotionListItem[]
  isLoading?: boolean
  selectedIds?: (string | number)[]
  onToggleSelect?: (id: string | number) => void
  onToggleSelectAll?: () => void
  onEdit: (promotion: PromotionListItem) => void
  onDelete?: (promotion: PromotionListItem) => void
}

export default function PromotionTable({
  promotions,
  isLoading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete
}: PromotionTableProps) {
  const { t } = useTranslation()
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const isAllSelected = promotions.length > 0 && promotions.every((p) => selectedIds.includes(p.id))
  const isSomeSelected = promotions.some((p) => selectedIds.includes(p.id)) && !isAllSelected

  const handleCopyCoupon = (code: string, id: number) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code)
      setCopiedId(id)
      showToast("success", "toasts.couponCopied")
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const renderApplyToBadge = (applyTo: PromotionListItem["applyTo"]) => {
    switch (applyTo) {
      case "PRODUCT":
        return (
          <Badge
            size='micro'
            variant='outline'
            className='gap-1 font-medium text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/30'
          >
            <Package className='size-2.5 shrink-0' />
            <span>{t("promotion.scope.product", "Products")}</span>
          </Badge>
        )
      case "CATEGORY":
        return (
          <Badge
            size='micro'
            variant='outline'
            className='gap-1 font-medium text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/40 bg-purple-50/70 dark:bg-purple-950/30'
          >
            <FolderTree className='size-2.5 shrink-0' />
            <span>{t("promotion.scope.category", "Categories")}</span>
          </Badge>
        )
      case "BRAND":
        return (
          <Badge
            size='micro'
            variant='outline'
            className='gap-1 font-medium text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/40 bg-teal-50/70 dark:bg-teal-950/30'
          >
            <Award className='size-2.5 shrink-0' />
            <span>{t("promotion.scope.brand", "Brands")}</span>
          </Badge>
        )
      case "ORDER":
      default:
        return (
          <Badge
            size='micro'
            variant='outline'
            className='gap-1 font-medium text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/30'
          >
            <ShoppingCart className='size-2.5 shrink-0' />
            <span>{t("promotion.scope.order", "Entire Order")}</span>
          </Badge>
        )
    }
  }

  const renderDiscountValue = (promo: PromotionListItem) => {
    if (promo.discountType === "PERCENTAGE") {
      return (
        <div className='flex flex-col gap-1'>
          <div className='inline-flex items-center gap-1 w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'>
            <Percent className='size-3 text-emerald-600 dark:text-emerald-400 shrink-0' />
            <span className='tabular-nums font-mono'>{promo.discountPercentage}% OFF</span>
          </div>
          {(promo.maxDiscountAmount != null || promo.minimumOrderPurchaseAmount != null) && (
            <div className='text-2xs text-muted-foreground flex items-center gap-1 font-mono'>
              {promo.maxDiscountAmount != null && <span>Max: ${promo.maxDiscountAmount}</span>}
              {promo.maxDiscountAmount != null && promo.minimumOrderPurchaseAmount != null && <span>•</span>}
              {promo.minimumOrderPurchaseAmount != null && <span>Min: ${promo.minimumOrderPurchaseAmount}</span>}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className='flex flex-col gap-1'>
        <div className='inline-flex items-center gap-1 w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'>
          <DollarSign className='size-3 text-blue-600 dark:text-blue-400 shrink-0' />
          <span className='tabular-nums font-mono'>${promo.discountAmount?.toFixed(2)} OFF</span>
        </div>
        {promo.minimumOrderPurchaseAmount != null && (
          <span className='text-2xs text-muted-foreground font-mono'>Min: ${promo.minimumOrderPurchaseAmount}</span>
        )}
      </div>
    )
  }

  const renderUsageCount = (promo: PromotionListItem) => {
    const isLimited = promo.usageType === "LIMITED"

    if (!isLimited) {
      return (
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-1'>
            <span className='font-semibold text-xs text-foreground font-mono tabular-nums'>{promo.usageCount}</span>
            <span className='text-2xs text-muted-foreground'>{t("promotion.redeemed", "redeemed")}</span>
          </div>
          <div className='inline-flex items-center gap-1 text-2xs text-muted-foreground/80 font-medium'>
            <Infinity className='size-3 text-muted-foreground/70 shrink-0' />
            <span>{t("promotion.noLimit", "No limit")}</span>
          </div>
        </div>
      )
    }

    const limit = promo.usageLimit || 0
    const pct = limit > 0 ? Math.min(100, Math.round((promo.usageCount / limit) * 100)) : 0
    const isExhausted = limit > 0 && promo.usageCount >= limit

    return (
      <div className='flex flex-col gap-1.5 w-28'>
        <div className='flex items-center justify-between text-xs'>
          <span className='font-semibold text-foreground font-mono tabular-nums'>
            {promo.usageCount}
            <span className='text-muted-foreground font-normal'> / {limit}</span>
          </span>
          <span
            className={cn(
              "text-2xs font-mono font-medium",
              isExhausted ? "text-destructive font-semibold" : "text-muted-foreground"
            )}
          >
            {pct}%
          </span>
        </div>
        <Progress
          value={pct}
          className={cn("h-1.5 bg-gray-100 dark:bg-zinc-800", isExhausted && "[&>div]:bg-destructive")}
        />
      </div>
    )
  }

  const renderValidityPeriod = (promo: PromotionListItem) => {
    const dateRangeStr = formatDateRange(promo.startDate, promo.endDate)
    const timeStatus = getPromotionTimeStatus(promo.startDate, promo.endDate, promo.isActive)

    const renderPeriodLabel = () => {
      switch (timeStatus.state) {
        case "expired":
          return <span className='text-rose-600 dark:text-rose-400 font-medium'>{t("status.expired", "Expired")}</span>
        case "upcoming":
          return (
            <span className='text-amber-600 dark:text-amber-400 font-medium'>
              {timeStatus.daysUntilStart === 1
                ? t("promotion.startsTomorrow", "Starts tomorrow")
                : t("promotion.startsIn", {
                    count: timeStatus.daysUntilStart,
                    defaultValue: `Starts in ${timeStatus.daysUntilStart} days`
                  })}
            </span>
          )
        case "ending_today":
          return (
            <span className='text-orange-600 dark:text-orange-400 font-semibold'>
              {t("promotion.endsToday", "Ends today")}
            </span>
          )
        case "ending_tomorrow":
          return (
            <span className='text-orange-600 dark:text-orange-400 font-medium'>
              {t("promotion.endsTomorrow", "Ends tomorrow")}
            </span>
          )
        case "ending_soon":
          return (
            <span className='text-orange-600 dark:text-orange-400 font-medium'>
              {t("promotion.daysLeft", {
                count: timeStatus.daysRemaining,
                defaultValue: `${timeStatus.daysRemaining} days left`
              })}
            </span>
          )
        case "inactive":
          return <span className='text-zinc-500 font-medium'>{t("status.inactive", "Inactive")}</span>
        default:
          return (
            <span className='text-muted-foreground'>
              {t("promotion.daysRemaining", {
                count: timeStatus.daysRemaining,
                defaultValue: `${timeStatus.daysRemaining} days remaining`
              })}
            </span>
          )
      }
    }

    return (
      <div className='flex items-start gap-2'>
        <div className='p-1.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-muted-foreground shrink-0 mt-0.5'>
          <Calendar className='size-3.5' />
        </div>
        <div className='flex flex-col gap-0.5 leading-tight'>
          <span className='text-xs font-medium text-foreground whitespace-nowrap'>{dateRangeStr}</span>
          <div className='text-2xs'>{renderPeriodLabel()}</div>
        </div>
      </div>
    )
  }

  const renderStatusBadge = (promo: PromotionListItem) => {
    const timeStatus = getPromotionTimeStatus(promo.startDate, promo.endDate, promo.isActive)

    if (timeStatus.state === "expired") {
      return (
        <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'>
          <span className='size-1.5 rounded-full bg-rose-500 shrink-0' />
          {t("status.expired", "Expired")}
        </span>
      )
    }

    if (!promo.isActive) {
      return (
        <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60'>
          <span className='size-1.5 rounded-full bg-zinc-400 shrink-0' />
          {t("status.inactive", "Inactive")}
        </span>
      )
    }

    if (timeStatus.state === "upcoming") {
      return (
        <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'>
          <span className='size-1.5 rounded-full bg-amber-500 shrink-0' />
          {t("status.upcoming", "Upcoming")}
        </span>
      )
    }

    return (
      <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'>
        <span className='size-1.5 rounded-full bg-emerald-500 shrink-0' />
        {t("status.active", "Active")}
      </span>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs overflow-hidden'>
        <Table>
          <TableHeader className='bg-gray-50/80 dark:bg-zinc-800/50'>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='w-[48px] px-4'>
                <Checkbox
                  checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
                  onCheckedChange={() => onToggleSelectAll?.()}
                  aria-label='Select all promotions'
                />
              </TableHead>
              <TableHead className='min-w-[150px] font-semibold text-gray-700 dark:text-gray-200'>
                {t("promotion.couponCode", "Coupon Code")}
              </TableHead>
              <TableHead className='min-w-[220px] font-semibold text-gray-700 dark:text-gray-200'>
                {t("promotion.name", "Promotion Name")}
              </TableHead>
              <TableHead className='min-w-[150px] font-semibold text-gray-700 dark:text-gray-200'>
                {t("promotion.discount", "Discount")}
              </TableHead>
              <TableHead className='min-w-[140px] font-semibold text-gray-700 dark:text-gray-200'>
                {t("promotion.usage", "Redemptions")}
              </TableHead>
              <TableHead className='min-w-[190px] font-semibold text-gray-700 dark:text-gray-200'>
                {t("promotion.dateRange", "Validity Period")}
              </TableHead>
              <TableHead className='w-[110px] text-center font-semibold text-gray-700 dark:text-gray-200'>
                {t("label.status", "Status")}
              </TableHead>
              <TableHead className='w-[90px] text-right font-semibold text-gray-700 dark:text-gray-200'>
                {t("label.actions", "Actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className='px-4'>
                    <Skeleton className='size-4 rounded' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-6 w-28 rounded-md' />
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col gap-1.5'>
                      <Skeleton className='h-4 w-36 rounded' />
                      <Skeleton className='h-3 w-20 rounded' />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col gap-1'>
                      <Skeleton className='h-5 w-24 rounded-full' />
                      <Skeleton className='h-3 w-16 rounded' />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col gap-1.5 w-28'>
                      <Skeleton className='h-4 w-16 rounded' />
                      <Skeleton className='h-1.5 w-full rounded-full' />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='size-6 rounded-md' />
                      <div className='flex flex-col gap-1'>
                        <Skeleton className='h-3.5 w-28 rounded' />
                        <Skeleton className='h-3 w-16 rounded' />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Skeleton className='h-5 w-16 mx-auto rounded-full' />
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <Skeleton className='size-8 rounded-md' />
                      <Skeleton className='size-8 rounded-md' />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-48 text-center text-muted-foreground'>
                  <div className='flex flex-col items-center justify-center gap-2 py-6'>
                    <div className='p-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-muted-foreground/70'>
                      <Tag className='size-6' />
                    </div>
                    <div className='space-y-0.5'>
                      <p className='text-sm font-medium text-foreground'>
                        {t("promotion.emptyState", "No promotions found")}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {t("promotion.emptyDescription", "Try adjusting your search criteria or create a new promotion")}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promo) => {
                const isSelected = selectedIds.includes(promo.id)

                return (
                  <TableRow
                    key={promo.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(
                      "hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors",
                      isSelected && "bg-primary/5 dark:bg-primary/10"
                    )}
                  >
                    <TableCell className='px-4'>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect?.(promo.id)}
                        aria-label={`Select ${promo.name}`}
                      />
                    </TableCell>

                    <TableCell>
                      <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-dashed border-violet-300 dark:border-violet-800/60'>
                        <Ticket className='size-3.5 text-violet-500 dark:text-violet-400 shrink-0' />
                        <span className='tracking-wider uppercase select-all'>{promo.couponCode}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon-xs'
                              className='size-4.5 p-0 text-violet-600 hover:text-violet-900 hover:bg-violet-200/60 dark:text-violet-400 dark:hover:bg-violet-900/50 cursor-pointer ml-0.5'
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyCoupon(promo.couponCode, promo.id)
                              }}
                              aria-label={`Copy coupon code ${promo.couponCode}`}
                            >
                              {copiedId === promo.id ? (
                                <Check className='size-3 text-emerald-600 dark:text-emerald-400' />
                              ) : (
                                <Copy className='size-3' />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side='top' className='text-2xs'>
                            {copiedId === promo.id ? t("common.copied", "Copied!") : t("common.copy", "Copy code")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-1 py-0.5'>
                        <span className='font-semibold text-sm text-foreground line-clamp-1' title={promo.name}>
                          {promo.name}
                        </span>
                        <div className='flex items-center gap-1.5'>
                          {renderApplyToBadge(promo.applyTo)}
                          {promo.description && (
                            <span
                              className='text-2xs text-muted-foreground truncate max-w-[140px]'
                              title={promo.description}
                            >
                              {promo.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{renderDiscountValue(promo)}</TableCell>

                    <TableCell>{renderUsageCount(promo)}</TableCell>

                    <TableCell>{renderValidityPeriod(promo)}</TableCell>

                    <TableCell className='text-center'>{renderStatusBadge(promo)}</TableCell>

                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon-sm'
                              onClick={() => onEdit(promo)}
                              aria-label={t("button.edit", "Edit")}
                              className='cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-zinc-800'
                            >
                              <Edit2 className='size-3.5' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side='left' className='text-2xs'>
                            {t("button.edit", "Edit")}
                          </TooltipContent>
                        </Tooltip>

                        {onDelete && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon-sm'
                                onClick={() => onDelete(promo)}
                                aria-label={t("button.delete", "Delete")}
                                className='cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                              >
                                <Trash2 className='size-3.5' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side='left' className='text-2xs'>
                              {t("button.delete", "Delete")}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}

