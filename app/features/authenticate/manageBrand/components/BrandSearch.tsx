import { useTranslation } from 'react-i18next'
import Search, { type SearchProps } from '~/shared/components/Search'

export interface BrandSearchProps extends Omit<SearchProps, 'placeholder'> {
  placeholder?: string
}

export default function BrandSearch({ placeholder, ...props }: BrandSearchProps) {
  const { t } = useTranslation()
  return <Search placeholder={placeholder || t('brand.searchPlaceholder')} {...props} />
}
