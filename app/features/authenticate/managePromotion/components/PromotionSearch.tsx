import { useTranslation } from "react-i18next"
import Search, { type SearchProps } from "~/shared/components/Search"

export interface PromotionSearchProps extends Omit<SearchProps, "placeholder"> {
  placeholder?: string
}

export default function PromotionSearch({
  placeholder,
  ...props
}: PromotionSearchProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder =
    placeholder || t("promotion.searchPlaceholder", { defaultValue: "Search by promotion name or coupon code..." })

  return <Search placeholder={resolvedPlaceholder} {...props} />
}
