import Search, { type SearchProps } from '~/shared/components/Search'

export interface CategorySearchProps extends Omit<SearchProps, 'placeholder'> {
  placeholder?: string
}

export default function CategorySearch({
  placeholder = 'Search categories by name or ID...',
  ...props
}: CategorySearchProps) {
  return <Search placeholder={placeholder} {...props} />
}
