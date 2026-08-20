import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  X,
  AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/core/components/shadcn/popover'
import { Button } from '~/core/components/shadcn/button'
import { Input } from '~/core/components/shadcn/input'
import { cn } from '~/shared/utils/appUtils'
import type { PageResponse } from '~/shared/types'

export interface InfiniteSelectFetchParams {
  pageNumber: number
  pageSize: number
  search: string
}

export interface InfiniteSelectProps<T> {
  fetchData: (
    params: InfiniteSelectFetchParams
  ) => Promise<PageResponse<T> | { content: T[]; totalPages: number; totalElements?: number }>
  value?: string | null
  onChange?: (value: string, item?: T) => void
  onSelectOption?: (item: T) => void
  getOptionValue?: (item: T) => string
  getOptionLabel?: (item: T) => string
  renderOption?: (item: T, isSelected: boolean, isDisabled: boolean) => React.ReactNode
  selectedItem?: T | null
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  disabledOptionIds?: string[]
  disabledOptionBadge?: string
  pageSize?: number
  debounceMs?: number
  className?: string
  triggerClassName?: string
  popoverContentClassName?: string
  emptyMessage?: string
  clearable?: boolean
  autoCloseOnSelect?: boolean
  initialItems?: T[]
}

export default function InfiniteSelect<T extends Record<string, any>>({
  fetchData,
  value,
  onChange,
  onSelectOption,
  getOptionValue = (item: T) => String(item.id ?? item.value ?? item),
  getOptionLabel = (item: T) => String(item.name ?? item.label ?? item.title ?? item),
  renderOption,
  selectedItem,
  placeholder,
  searchPlaceholder,
  disabled = false,
  disabledOptionIds = [],
  disabledOptionBadge,
  pageSize = 10,
  debounceMs = 300,
  className,
  triggerClassName,
  popoverContentClassName,
  emptyMessage,
  clearable = false,
  autoCloseOnSelect = true,
  initialItems
}: InfiniteSelectProps<T>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<T[]>(initialItems || [])
  const [pageNumber, setPageNumber] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Find currently selected item among loaded items or use selectedItem prop
  const currentSelected = items.find((item) => getOptionValue(item) === value) || selectedItem

  // Handle debounced search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery, debounceMs])

  // Fetch initial page when popover opens or debounced search changes
  const loadFirstPage = useCallback(
    async (searchTerm: string) => {
      try {
        setIsLoadingInitial(true)
        setError(null)
        const response = await fetchData({
          pageNumber: 1,
          pageSize,
          search: searchTerm
        })

        const content = response.content || []
        const totalPages = response.totalPages ?? 1

        setItems(content)
        setPageNumber(1)
        setHasMore(totalPages > 1)
      } catch (err: any) {
        console.error('InfiniteSelect loadFirstPage error:', err)
        setError(err?.message || 'Failed to load options')
      } finally {
        setIsLoadingInitial(false)
      }
    },
    [fetchData, pageSize]
  )

  // Trigger loadFirstPage when popover opens or search changes
  useEffect(() => {
    if (open) {
      loadFirstPage(debouncedSearch)
    }
  }, [open, debouncedSearch, loadFirstPage])

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setSearchQuery('')
      setDebouncedSearch('')
    }
  }, [open])

  // Load next page
  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || isLoadingInitial || !hasMore) return

    try {
      setIsLoadingMore(true)
      const nextPage = pageNumber + 1
      const response = await fetchData({
        pageNumber: nextPage,
        pageSize,
        search: debouncedSearch
      })

      const newContent = response.content || []
      const totalPages = response.totalPages ?? 1

      setItems((prevItems) => {
        const existingValSet = new Set(prevItems.map((item) => getOptionValue(item)))
        const filteredNew = newContent.filter((item) => !existingValSet.has(getOptionValue(item)))
        return [...prevItems, ...filteredNew]
      })

      setPageNumber(nextPage)
      setHasMore(nextPage < totalPages)
    } catch (err: any) {
      console.error('InfiniteSelect loadNextPage error:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    isLoadingMore,
    isLoadingInitial,
    hasMore,
    pageNumber,
    fetchData,
    pageSize,
    debouncedSearch,
    getOptionValue
  ])

  // IntersectionObserver for sentinel element at bottom of scroll list
  useEffect(() => {
    if (!open || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first && first.isIntersecting && hasMore && !isLoadingMore && !isLoadingInitial) {
          loadNextPage()
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1
      }
    )

    const currentSentinel = sentinelRef.current
    observer.observe(currentSentinel)

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel)
      }
      observer.disconnect()
    }
  }, [open, hasMore, isLoadingMore, isLoadingInitial, loadNextPage])

  const handleSelect = (item: T) => {
    const itemVal = getOptionValue(item)
    if (disabledOptionIds.includes(itemVal)) return

    onChange?.(itemVal, item)
    onSelectOption?.(item)

    if (autoCloseOnSelect) {
      setOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.('', undefined)
  }

  return (
    <div className={cn('relative w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-left h-10 px-3 hover:bg-gray-50/80 dark:hover:bg-zinc-800/80 transition-colors',
              !currentSelected && 'text-muted-foreground',
              triggerClassName
            )}
          >
            <span className='truncate block max-w-[calc(100%-2rem)]'>
              {currentSelected
                ? getOptionLabel(currentSelected)
                : placeholder || t('infiniteSelect.placeholder', 'Select an option...')}
            </span>

            <div className='flex items-center gap-1 shrink-0 ml-2'>
              {clearable && currentSelected && !disabled && (
                <div
                  role='button'
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleClear(e as any)
                    }
                  }}
                  className='p-0.5 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full text-muted-foreground hover:text-foreground transition-colors'
                >
                  <X className='size-3.5' />
                </div>
              )}
              <ChevronDown className='size-4 text-muted-foreground opacity-70' />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align='start'
          className={cn(
            'p-0 w-(--radix-popover-trigger-width) min-w-[260px] max-w-[420px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-lg rounded-lg overflow-hidden',
            popoverContentClassName
          )}
        >
          {/* Search Header */}
          <div className='p-2 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50'>
            <div className='relative flex items-center'>
              <Search className='size-4 absolute left-2.5 text-muted-foreground pointer-events-none' />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder || t('infiniteSelect.searchPlaceholder', 'Type to search...')}
                className='pl-8 pr-8 h-8 text-xs bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 focus-visible:ring-1'
              />
              {searchQuery && (
                <button
                  type='button'
                  onClick={() => setSearchQuery('')}
                  className='absolute right-2.5 text-muted-foreground hover:text-foreground p-0.5'
                >
                  <X className='size-3.5' />
                </button>
              )}
            </div>
          </div>

          {/* Options List Container */}
          <div
            ref={containerRef}
            className='max-h-60 overflow-y-auto p-1 divide-y divide-transparent scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700'
          >
            {isLoadingInitial ? (
              <div className='py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                <Loader2 className='size-5 animate-spin text-primary' />
                <span className='text-xs'>{t('infiniteSelect.loading', 'Loading options...')}</span>
              </div>
            ) : error ? (
              <div className='py-6 px-3 flex flex-col items-center justify-center text-center gap-1.5 text-red-500'>
                <AlertCircle className='size-5' />
                <span className='text-xs font-medium'>{error}</span>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => loadFirstPage(debouncedSearch)}
                  className='h-7 text-xs mt-1 text-primary hover:underline'
                >
                  {t('button.retry', 'Retry')}
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className='py-8 text-center px-4'>
                <p className='text-xs text-muted-foreground'>
                  {emptyMessage || t('infiniteSelect.noOptions', 'No options found')}
                </p>
              </div>
            ) : (
              <>
                {items.map((item) => {
                  const itemVal = getOptionValue(item)
                  const itemLabel = getOptionLabel(item)
                  const isSelected = value === itemVal
                  const isItemDisabled = disabledOptionIds.includes(itemVal)

                  return (
                    <div
                      key={itemVal}
                      role='option'
                      aria-selected={isSelected}
                      aria-disabled={isItemDisabled}
                      onClick={() => !isItemDisabled && handleSelect(item)}
                      className={cn(
                        'relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-sm cursor-pointer select-none transition-colors group',
                        isSelected
                          ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20'
                          : 'hover:bg-gray-100 dark:hover:bg-zinc-800/70 text-gray-800 dark:text-gray-200',
                        isItemDisabled &&
                          'opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent'
                      )}
                    >
                      <div className='flex items-center gap-2 flex-1 min-w-0'>
                        {renderOption ? (
                          renderOption(item, isSelected, isItemDisabled)
                        ) : (
                          <span className='truncate'>{itemLabel}</span>
                        )}
                      </div>

                      <div className='flex items-center gap-1.5 shrink-0'>
                        {isItemDisabled && (
                          <span className='text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-muted-foreground'>
                            {disabledOptionBadge || t('infiniteSelect.added', 'Added')}
                          </span>
                        )}
                        {isSelected && <Check className='size-4 text-primary shrink-0' />}
                      </div>
                    </div>
                  )
                })}

                {/* Infinite Scroll Sentinel & Loader */}
                <div ref={sentinelRef} className='py-2 flex items-center justify-center min-h-[28px]'>
                  {isLoadingMore && (
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground py-1'>
                      <Loader2 className='size-3.5 animate-spin text-primary' />
                      <span>{t('infiniteSelect.loadingMore', 'Loading more...')}</span>
                    </div>
                  )}
                  {!hasMore && items.length > pageSize && (
                    <span className='text-[11px] text-muted-foreground/60'>
                      {t('infiniteSelect.allLoaded', 'All items loaded')}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
