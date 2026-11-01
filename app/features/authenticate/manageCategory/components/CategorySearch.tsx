import { useTranslation } from 'react-i18next'
import Search, { type SearchProps } from '~/shared/components/Search'

export interface CategorySearchProps extends Omit<SearchProps, 'placeholder'> {
  placeholder?: string
}

export default function CategorySearch({
  placeholder,
  ...props
}: CategorySearchProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder =
    placeholder || t('category.searchPlaceholder', { defaultValue: 'Search categories by name or ID...' })

  return <Search placeholder={resolvedPlaceholder} {...props} />
}
