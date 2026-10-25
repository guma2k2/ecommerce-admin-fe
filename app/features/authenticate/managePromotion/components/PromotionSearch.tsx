import Search, { type SearchProps } from "~/shared/components/Search"

export interface PromotionSearchProps extends Omit<SearchProps, "placeholder"> {
  placeholder?: string
}

export default function PromotionSearch({
  placeholder = "Search by promotion name or coupon code...",
  ...props
}: PromotionSearchProps) {
  return <Search placeholder={placeholder} {...props} />
}
