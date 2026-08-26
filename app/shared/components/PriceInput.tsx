import React, { useState, useEffect, forwardRef } from 'react'
import { Input } from '~/core/components/shadcn/input'
import { cn } from '~/shared/utils/appUtils'

export interface PriceInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'defaultValue'> {
  value?: number | string | null
  onChange?: (value: number) => void
  prefix?: string
  suffix?: string
  allowDecimals?: boolean
  maxDecimals?: number
}

export function formatPriceDisplay(
  val: number | string | null | undefined,
  prefix = '',
  suffix = '',
  allowDecimals = true,
  maxDecimals = 2
): string {
  if (val === '' || val === null || val === undefined) return ''
  const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val
  if (isNaN(num)) return ''
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: allowDecimals ? maxDecimals : 0
  }).format(num)
  return `${prefix}${formatted}${suffix}`
}

export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  (
    {
      value = 0,
      onChange,
      prefix = '',
      suffix = '',
      allowDecimals = true,
      maxDecimals = 2,
      className,
      placeholder,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [inputValue, setInputValue] = useState('')

    // Synchronize internal display value when external value changes
    useEffect(() => {
      if (!isFocused) {
        setInputValue(formatPriceDisplay(value, prefix, suffix, allowDecimals, maxDecimals))
      }
    }, [value, isFocused, prefix, suffix, allowDecimals, maxDecimals])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      // When focused: show raw numeric value without currency prefixes or thousand commas
      const rawNum =
        value === '' || value === null || value === undefined
          ? ''
          : typeof value === 'string'
          ? value.replace(/,/g, '')
          : value === 0
          ? ''
          : String(value)

      setInputValue(rawNum)
      onFocus?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawText = e.target.value
      // Allow only digits and at most one decimal point
      let sanitized = allowDecimals
        ? rawText.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
        : rawText.replace(/[^0-9]/g, '')

      if (allowDecimals && sanitized.includes('.')) {
        const [intPart, decPart] = sanitized.split('.')
        sanitized = `${intPart}.${decPart.slice(0, maxDecimals)}`
      }

      setInputValue(sanitized)
      const parsed = parseFloat(sanitized)
      onChange?.(isNaN(parsed) ? 0 : parsed)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      const num = parseFloat(inputValue.replace(/,/g, '')) || 0
      onChange?.(num)
      setInputValue(formatPriceDisplay(num, prefix, suffix, allowDecimals, maxDecimals))
      onBlur?.(e)
    }

    return (
      <Input
        ref={ref}
        type='text'
        inputMode={allowDecimals ? 'decimal' : 'numeric'}
        value={inputValue}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder || `${prefix}0.00${suffix}`}
        className={cn('font-medium', className)}
        {...props}
      />
    )
  }
)

PriceInput.displayName = 'PriceInput'

export default PriceInput
