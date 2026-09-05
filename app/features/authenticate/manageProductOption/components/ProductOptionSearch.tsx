import { useTranslation } from 'react-i18next'
import Search, { type SearchProps } from '~/shared/components/Search'

export interface ProductOptionSearchProps extends Omit<SearchProps, 'placeholder'> {
  placeholder?: string
}

export default function ProductOptionSearch({ placeholder, ...props }: ProductOptionSearchProps) {
  const { t } = useTranslation()
  return <Search placeholder={placeholder || t('productOption.searchPlaceholder')} {...props} />
}
