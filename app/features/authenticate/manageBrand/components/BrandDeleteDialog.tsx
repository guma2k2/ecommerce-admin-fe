import DeleteConfirmDialog from "~/shared/components/DeleteConfirmDialog"

export interface BrandDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount?: number
  selectedBrands?: unknown[]
  brandToDelete?: unknown | null
  onConfirm: () => Promise<void>
}

export default function BrandDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  selectedBrands = [],
  brandToDelete,
  onConfirm
}: BrandDeleteDialogProps) {
  const count = selectedCount ?? (brandToDelete ? 1 : selectedBrands.length)

  return <DeleteConfirmDialog open={open} onOpenChange={onOpenChange} selectedCount={count} onConfirm={onConfirm} />
}
