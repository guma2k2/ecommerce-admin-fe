import Pagination, { type PaginationProps } from '~/shared/components/Pagination'

export type ProductAttributeTemplatePaginationProps = PaginationProps

export default function ProductAttributeTemplatePagination(props: ProductAttributeTemplatePaginationProps) {
  return <Pagination {...props} />
}
