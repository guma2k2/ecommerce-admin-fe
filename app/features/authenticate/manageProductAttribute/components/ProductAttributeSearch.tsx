import { useTranslation } from 'react-i18next'
import Search, { type SearchProps } from '~/shared/components/Search'

export interface ProductAttributeSearchProps extends Omit<SearchProps, 'placeholder'> {
  placeholder?: string
}

export default function ProductAttributeSearch({ placeholder, ...props }: ProductAttributeSearchProps) {
  const { t } = useTranslation()
  return <Search placeholder={placeholder || t('productAttribute.searchPlaceholder')} {...props} />
}
