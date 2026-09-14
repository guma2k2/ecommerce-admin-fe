import DeleteConfirmDialog from "~/shared/components/DeleteConfirmDialog"

export interface ProductAttributeDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount?: number
  selectedAttributes?: unknown[]
  attributeToDelete?: unknown | null
  onConfirm: () => Promise<void>
}

export default function ProductAttributeDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  selectedAttributes = [],
  attributeToDelete,
  onConfirm
}: ProductAttributeDeleteDialogProps) {
  const count = selectedCount ?? (attributeToDelete ? 1 : selectedAttributes.length)

  return <DeleteConfirmDialog open={open} onOpenChange={onOpenChange} selectedCount={count} onConfirm={onConfirm} />
}
