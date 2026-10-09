import { useMemo } from 'react'
import { Boxes, PackageCheck, ClockAlert, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { InventoryItem } from '~/shared/types'

interface InventorySummaryCardsProps {
  items: InventoryItem[]
  totalElements: number
}

export default function InventorySummaryCards({
  items,
  totalElements
}: InventorySummaryCardsProps) {
  const { t } = useTranslation()

  const summary = useMemo(() => {
    let totalOnHand = 0
    let totalReserved = 0
    let lowStockCount = 0
    let outOfStockCount = 0

    items.forEach((item) => {
      totalOnHand += item.onHand
      totalReserved += item.reserved
      if (item.available === 0) {
        outOfStockCount += 1
      } else if (item.available <= 10) {
        lowStockCount += 1
      }
    })

    return {
      totalSkus: totalElements,
      totalOnHand,
      totalReserved,
      alertCount: lowStockCount + outOfStockCount,
      lowStockCount,
      outOfStockCount
    }
  }, [items, totalElements])

  const cards = [
    {
      id: 'total-skus',
      title: t('inventory.kpiTotalSkus'),
      value: summary.totalSkus,
      description: t('inventory.totalCount', { count: summary.totalSkus }),
      icon: Boxes,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'total-on-hand',
      title: t('inventory.kpiTotalOnHand'),
      value: summary.totalOnHand,
      description: 'Physical inventory on shelves',
      icon: PackageCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      id: 'total-reserved',
      title: t('inventory.kpiTotalReserved'),
      value: summary.totalReserved,
      description: 'Active 15-min checkout holds',
      icon: ClockAlert,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      id: 'stock-alerts',
      title: t('inventory.kpiLowStock'),
      value: summary.alertCount,
      description: `${summary.outOfStockCount} out of stock • ${summary.lowStockCount} low`,
      icon: AlertTriangle,
      iconColor: summary.alertCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500',
      bgColor: summary.alertCount > 0 ? 'bg-rose-500/10' : 'bg-zinc-500/10'
    }
  ]

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <div
            key={card.id}
            className='bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors duration-150'
          >
            <div className='space-y-1 min-w-0'>
              <p className='text-xs font-medium text-muted-foreground truncate'>{card.title}</p>
              <p className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 tabular-nums'>
                {card.value.toLocaleString()}
              </p>
              <p className='text-xs text-muted-foreground truncate'>{card.description}</p>
            </div>
            <div className={`size-11 rounded-lg ${card.bgColor} ${card.iconColor} flex items-center justify-center shrink-0`}>
              <IconComponent className='size-5' aria-hidden='true' />
            </div>
          </div>
        )
      })}
    </div>
  )
}
