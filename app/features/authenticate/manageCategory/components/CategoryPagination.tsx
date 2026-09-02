import Pagination, { type PaginationProps } from '~/shared/components/Pagination'

export type CategoryPaginationProps = PaginationProps

export default function CategoryPagination(props: CategoryPaginationProps) {
  return <Pagination {...props} />
}
