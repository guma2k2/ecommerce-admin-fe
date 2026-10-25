import { useTranslation } from "react-i18next"
import { Edit2, Trash2, Calendar, Tag, Percent, DollarSign } from "lucide-react"
import type { PromotionListItem } from "~/shared/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/core/components/shadcn/table"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"
import { Skeleton } from "~/core/components/shadcn/skeleton"
import { formatDateParts } from "~/shared/utils/appUtils"

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

  const isAllSelected = promotions.length > 0 && promotions.every((p) => selectedIds.includes(p.id))
  const isSomeSelected = promotions.some((p) => selectedIds.includes(p.id)) && !isAllSelected

  const renderStatusBadge = (promo: PromotionListItem) => {
    const now = new Date()
    const isExpired = new Date(promo.endDate) < now

    if (isExpired) {
      return (
        <Badge variant='outline' className='text-muted-foreground'>
          {t("status.expired", "Expired")}
        </Badge>
      )
    }

    if (!promo.isActive) {
      return <Badge variant='secondary'>{t("status.inactive", "Inactive")}</Badge>
    }

    return (
      <Badge variant='default' className='bg-emerald-600 hover:bg-emerald-700'>
        {t("status.active", "Active")}
      </Badge>
    )
  }

  const renderDiscountValue = (promo: PromotionListItem) => {
    if (promo.discountType === "PERCENTAGE") {
      return (
        <div className='flex items-center gap-1.5'>
          <Percent className='size-3.5 text-muted-foreground' />
          <span className='font-mono text-xs tabular-nums font-semibold'>{promo.discountPercentage}%</span>
          {promo.maxDiscountAmount != null && (
            <span className='text-xs text-muted-foreground font-mono'>(Max: ${promo.maxDiscountAmount})</span>
          )}
        </div>
      )
    }

    return (
      <div className='flex items-center gap-1.5'>
        <DollarSign className='size-3.5 text-muted-foreground' />
        <span className='font-mono text-xs tabular-nums font-semibold'>${promo.discountAmount?.toFixed(2)}</span>
      </div>
    )
  }

  const renderUsageCount = (promo: PromotionListItem) => {
    const isLimited = promo.usageType === "LIMITED"
    return (
      <div className='font-mono text-xs tabular-nums text-foreground'>
        <span>{promo.usageCount}</span>
        <span className='text-muted-foreground'> / </span>
        <span>{isLimited ? promo.usageLimit : "∞"}</span>
      </div>
    )
  }

  return (
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
            <TableHead className='min-w-[140px]'>{t("promotion.couponCode", "Coupon Code")}</TableHead>
            <TableHead className='min-w-[200px]'>{t("promotion.name", "Promotion Name")}</TableHead>
            <TableHead className='min-w-[140px]'>{t("promotion.discount", "Discount")}</TableHead>
            <TableHead className='min-w-[120px]'>{t("promotion.usage", "Redemptions")}</TableHead>
            <TableHead className='min-w-[180px]'>{t("promotion.dateRange", "Validity Period")}</TableHead>
            <TableHead className='w-[100px] text-center'>{t("label.status", "Status")}</TableHead>
            <TableHead className='w-[100px] text-right'>{t("label.actions", "Actions")}</TableHead>
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
                  <Skeleton className='h-5 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-36' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-28' />
                </TableCell>
                <TableCell className='text-center'>
                  <Skeleton className='h-5 w-14 mx-auto' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='h-8 w-16 ml-auto' />
                </TableCell>
              </TableRow>
            ))
          ) : promotions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className='h-32 text-center text-muted-foreground'>
                <div className='flex flex-col items-center justify-center gap-1.5'>
                  <Tag className='size-6 text-muted-foreground/60' />
                  <p className='text-sm'>{t("promotion.emptyState", "No promotions found")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            promotions.map((promo) => {
              const isSelected = selectedIds.includes(promo.id)
              const start = formatDateParts(promo.startDate)
              const end = formatDateParts(promo.endDate)

              return (
                <TableRow
                  key={promo.id}
                  data-state={isSelected ? "selected" : undefined}
                  className='hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors'
                >
                  <TableCell className='px-4'>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect?.(promo.id)}
                      aria-label={`Select ${promo.name}`}
                    />
                  </TableCell>

                  <TableCell>
                    <span className='font-mono text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded'>
                      {promo.couponCode}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-medium text-sm text-foreground line-clamp-1'>{promo.name}</span>
                      <div className='flex items-center gap-1'>
                        <Badge size='micro' variant='outline' className='uppercase'>
                          {promo.applyTo}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{renderDiscountValue(promo)}</TableCell>

                  <TableCell>{renderUsageCount(promo)}</TableCell>

                  <TableCell>
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <Calendar className='size-3.5 shrink-0' />
                      <div className='flex flex-col font-mono text-2xs tabular-nums leading-tight'>
                        <span>{start.dateStr}</span>
                        <span>→ {end.dateStr}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className='text-center'>{renderStatusBadge(promo)}</TableCell>

                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onEdit(promo)}
                        title={t("button.edit", "Edit")}
                      >
                        <Edit2 className='size-4 text-muted-foreground hover:text-foreground' />
                      </Button>
                      {onDelete && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onDelete(promo)}
                          title={t("button.delete", "Delete")}
                        >
                          <Trash2 className='size-4 text-destructive hover:text-destructive' />
                        </Button>
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
  )
}
