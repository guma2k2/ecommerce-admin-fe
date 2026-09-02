import Search, { type SearchProps } from '~/shared/components/Search'

export interface ProductSearchProps extends Omit<SearchProps, 'placeholder'> {
  placeholder?: string
}

export default function ProductSearch({
  placeholder = 'Search products by name or ID...',
  ...props
}: ProductSearchProps) {
  return <Search placeholder={placeholder} {...props} />
}
