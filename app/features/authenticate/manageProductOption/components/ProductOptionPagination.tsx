import Pagination, { type PaginationProps } from '~/shared/components/Pagination'

export type ProductOptionPaginationProps = PaginationProps

export default function ProductOptionPagination(props: ProductOptionPaginationProps) {
  return <Pagination {...props} />
}
