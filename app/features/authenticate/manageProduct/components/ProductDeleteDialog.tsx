import DeleteConfirmDialog from "~/shared/components/DeleteConfirmDialog"

export interface ProductDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  selectedProducts?: unknown[]
  onConfirm: () => Promise<void>
}

export default function ProductDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm
}: ProductDeleteDialogProps) {
  return (
    <DeleteConfirmDialog open={open} onOpenChange={onOpenChange} selectedCount={selectedCount} onConfirm={onConfirm} />
  )
}
