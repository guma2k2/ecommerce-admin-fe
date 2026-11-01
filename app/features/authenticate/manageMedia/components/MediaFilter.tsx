import { useTranslation } from 'react-i18next'
import { Search, LayoutGrid, LayoutList, RefreshCw } from 'lucide-react'

import { Input } from '~/core/components/shadcn/input'
import { Button } from '~/core/components/shadcn/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/core/components/shadcn/select'

interface MediaFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  typeValue: string
  onTypeChange: (value: string) => void
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
  onResetFilters: () => void
  isLoading?: boolean
}

export default function MediaFilter({
  searchValue,
  onSearchChange,
  typeValue,
  onTypeChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  isLoading
}: MediaFilterProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs'>
      {/* Left side: Search & Type filter */}
      <div className='flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3'>
        {/* Search input */}
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            placeholder={t('media.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-9 pr-4 h-9 bg-gray-50/50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700'
          />
        </div>

        {/* Type select filter */}
        <Select value={typeValue} onValueChange={onTypeChange}>
          <SelectTrigger className='w-full sm:w-[160px] h-9 bg-gray-50/50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700'>
            <SelectValue placeholder={t('media.filterByType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('media.allTypes')}</SelectItem>
            <SelectItem value='image'>{t('media.imagesOption')}</SelectItem>
            <SelectItem value='video'>{t('media.videosOption')}</SelectItem>
            <SelectItem value='document'>{t('media.documentsOption')}</SelectItem>
          </SelectContent>
        </Select>

        {(searchValue || typeValue !== 'all') && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onResetFilters}
            className='h-9 px-2 text-xs text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100 gap-1 self-start sm:self-auto'
          >
            <RefreshCw className='size-3.5' /> {t('media.clearFilters')}
          </Button>
        )}
      </div>

      {/* Right side: View mode toggle button group */}
      <div className='flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg border border-gray-200 dark:border-zinc-700 self-end sm:self-auto'>
        <Button
          variant={viewMode === 'table' ? 'secondary' : 'ghost'}
          size='sm'
          onClick={() => onViewModeChange('table')}
          className={`h-7 px-2.5 text-xs gap-1.5 shadow-none ${
            viewMode === 'table' ? 'bg-white dark:bg-zinc-900 shadow-xs font-semibold' : 'text-gray-600 dark:text-zinc-400'
          }`}
        >
          <LayoutList className='size-3.5' /> {t('media.viewTable')}
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size='sm'
          onClick={() => onViewModeChange('grid')}
          className={`h-7 px-2.5 text-xs gap-1.5 shadow-none ${
            viewMode === 'grid' ? 'bg-white dark:bg-zinc-900 shadow-xs font-semibold' : 'text-gray-600 dark:text-zinc-400'
          }`}
        >
          <LayoutGrid className='size-3.5' /> {t('media.viewGrid')}
        </Button>
      </div>
    </div>
  )
}
