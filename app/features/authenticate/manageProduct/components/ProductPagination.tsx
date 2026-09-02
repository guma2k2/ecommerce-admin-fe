import Pagination, { type PaginationProps } from '~/shared/components/Pagination'

export type ProductPaginationProps = PaginationProps

export default function ProductPagination(props: ProductPaginationProps) {
  return <Pagination {...props} />
}
