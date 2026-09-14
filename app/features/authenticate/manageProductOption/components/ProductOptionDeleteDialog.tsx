import DeleteConfirmDialog from "~/shared/components/DeleteConfirmDialog"

export interface ProductOptionDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount?: number
  selectedOptions?: unknown[]
  optionToDelete?: unknown | null
  onConfirm: () => Promise<void>
}

export default function ProductOptionDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  selectedOptions = [],
  optionToDelete,
  onConfirm
}: ProductOptionDeleteDialogProps) {
  const count = selectedCount ?? (optionToDelete ? 1 : selectedOptions.length)

  return <DeleteConfirmDialog open={open} onOpenChange={onOpenChange} selectedCount={count} onConfirm={onConfirm} />
}
