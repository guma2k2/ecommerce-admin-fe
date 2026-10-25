import DeleteConfirmDialog from "~/shared/components/DeleteConfirmDialog"
import type { PromotionListItem } from "~/shared/types"

export interface PromotionDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount?: number
  selectedPromotions?: PromotionListItem[]
  promotionToDelete?: PromotionListItem | null
  onConfirm: () => Promise<void>
}

export default function PromotionDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  selectedPromotions = [],
  promotionToDelete,
  onConfirm
}: PromotionDeleteDialogProps) {
  const count = selectedCount ?? (promotionToDelete ? 1 : selectedPromotions.length)

  return <DeleteConfirmDialog open={open} onOpenChange={onOpenChange} selectedCount={count} onConfirm={onConfirm} />
}
