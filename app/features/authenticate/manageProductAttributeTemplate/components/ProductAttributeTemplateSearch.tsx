import { useTranslation } from 'react-i18next'
import Search, { type SearchProps } from '~/shared/components/Search'

export interface ProductAttributeTemplateSearchProps extends Omit<SearchProps, 'placeholder'> {
  placeholder?: string
}

export default function ProductAttributeTemplateSearch({ placeholder, ...props }: ProductAttributeTemplateSearchProps) {
  const { t } = useTranslation()
  return <Search placeholder={placeholder || t('productAttributeTemplate.searchPlaceholder')} {...props} />
}
