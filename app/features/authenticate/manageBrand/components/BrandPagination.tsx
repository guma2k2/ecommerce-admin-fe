import Pagination, { type PaginationProps } from '~/shared/components/Pagination'

export type BrandPaginationProps = PaginationProps

export default function BrandPagination(props: BrandPaginationProps) {
  return <Pagination {...props} />
}
