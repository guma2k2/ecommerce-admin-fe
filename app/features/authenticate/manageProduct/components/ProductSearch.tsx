import { useTranslation } from 'react-i18next'
import Search, { type SearchProps } from '~/shared/components/Search'

export interface ProductSearchProps extends Omit<SearchProps, 'placeholder'> {
  placeholder?: string
}

export default function ProductSearch({
  placeholder,
  ...props
}: ProductSearchProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder =
    placeholder || t('product.searchPlaceholder', { defaultValue: 'Search products by name or ID...' })

  return <Search placeholder={resolvedPlaceholder} {...props} />
}
