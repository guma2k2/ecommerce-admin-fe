import { useTranslation } from 'react-i18next'
import Search from '~/shared/components/Search'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/core/components/shadcn/select'

export type StockFilterType = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

interface InventorySearchFilterProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: StockFilterType
  onStatusFilterChange: (status: StockFilterType) => void
  isLoading?: boolean
}

export default function InventorySearchFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isLoading = false
}: InventorySearchFilterProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs'>
      <Search
        value={search}
        onChange={onSearchChange}
        placeholder={t('inventory.searchPlaceholder')}
        isLoading={isLoading}
        className='w-full sm:max-w-md'
      />

      <div className='flex items-center gap-2 shrink-0'>
        <Select
          value={statusFilter}
          onValueChange={(val) => onStatusFilterChange(val as StockFilterType)}
          disabled={isLoading}
        >
          <SelectTrigger className='w-full sm:w-44 h-9 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-sm'>
            <SelectValue placeholder={t('inventory.filterAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('inventory.filterAll')}</SelectItem>
            <SelectItem value='IN_STOCK'>{t('inventory.filterInStock')}</SelectItem>
            <SelectItem value='LOW_STOCK'>{t('inventory.filterLowStock')}</SelectItem>
            <SelectItem value='OUT_OF_STOCK'>{t('inventory.filterOutOfStock')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
