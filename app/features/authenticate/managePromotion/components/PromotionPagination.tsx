import Pagination, { type PaginationProps } from "~/shared/components/Pagination"

export type PromotionPaginationProps = PaginationProps

export default function PromotionPagination(props: PromotionPaginationProps) {
  return <Pagination {...props} />
}
