import Pagination, { type PaginationProps } from '~/shared/components/Pagination'

export type ProductAttributePaginationProps = PaginationProps

export default function ProductAttributePagination(props: ProductAttributePaginationProps) {
  return <Pagination {...props} />
}
