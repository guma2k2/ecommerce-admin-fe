import { useState, useEffect } from 'react'
import { Search as SearchIcon, X, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '~/core/components/shadcn/input'
import { Button } from '~/core/components/shadcn/button'
import { cn } from '~/shared/utils/appUtils'

export interface SearchProps {
  value: string
  onChange: (value: string) => void
  isLoading?: boolean
  placeholder?: string
  debounceMs?: number
  className?: string
  inputClassName?: string
  disabled?: boolean
  onClear?: () => void
  autoFocus?: boolean
  ariaLabel?: string
}

export default function Search({
  value,
  onChange,
  isLoading = false,
  placeholder,
  debounceMs = 350,
  className,
  inputClassName,
  disabled = false,
  onClear,
  autoFocus,
  ariaLabel
}: SearchProps) {
  const { t } = useTranslation()
  const [internalValue, setInternalValue] = useState(value)

  const searchPlaceholder = placeholder || t('common.searchPlaceholder', 'Search...')

  // Synchronize internal value with parent value prop
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Debounce search query update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [internalValue, value, onChange, debounceMs])

  const handleClear = () => {
    setInternalValue('')
    onChange('')
    onClear?.()
  }

  return (
    <div className={cn('relative flex items-center w-full max-w-md', className)}>
      <div className='absolute left-3 flex items-center pointer-events-none text-muted-foreground'>
        {isLoading ? (
          <Loader2 className='size-4 animate-spin text-primary' />
        ) : (
          <SearchIcon className='size-4' />
        )}
      </div>

      <Input
        type='text'
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={searchPlaceholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel || searchPlaceholder}
        className={cn(
          'pl-9 pr-9 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-xs focus:ring-1',
          inputClassName
        )}
      />

      {internalValue && !disabled && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={handleClear}
          className='absolute right-1.5 h-7 w-7 text-muted-foreground hover:text-foreground rounded-full'
          title={t('common.clearSearch', 'Clear search')}
        >
          <X className='size-3.5' />
          <span className='sr-only'>{t('common.clearSearch', 'Clear search')}</span>
        </Button>
      )}
    </div>
  )
}

export { Search }
