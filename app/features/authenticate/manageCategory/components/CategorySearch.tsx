import { useState, useEffect } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "~/core/components/shadcn/input"
import { Button } from "~/core/components/shadcn/button"

interface CategorySearchProps {
  value: string
  onChange: (value: string) => void
  isLoading?: boolean
  placeholder?: string
}

export default function CategorySearch({
  value,
  onChange,
  isLoading = false,
  placeholder = "Search categories by name or ID..."
}: CategorySearchProps) {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [internalValue, value, onChange])

  const handleClear = () => {
    setInternalValue("")
    onChange("")
  }

  return (
    <div className='relative flex items-center w-full max-w-md'>
      <div className='absolute left-3 flex items-center pointer-events-none text-muted-foreground'>
        {isLoading ? <Loader2 className='size-4 animate-spin text-primary' /> : <Search className='size-4' />}
      </div>

      <Input
        type='text'
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className='pl-9 pr-9 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-xs focus:ring-1'
      />

      {internalValue && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={handleClear}
          className='absolute right-1.5 h-7 w-7 text-muted-foreground hover:text-foreground rounded-full'
          title='Clear search'
        >
          <X className='size-3.5' />
          <span className='sr-only'>Clear search</span>
        </Button>
      )}
    </div>
  )
}
