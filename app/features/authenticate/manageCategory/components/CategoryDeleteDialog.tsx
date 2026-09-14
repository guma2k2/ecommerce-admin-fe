import DeleteConfirmDialog from "~/shared/components/DeleteConfirmDialog"

export interface CategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount?: number
  selectedCategories?: unknown[]
  categoryToDelete?: unknown | null
  onConfirm: () => Promise<void>
}

export default function CategoryDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  selectedCategories = [],
  categoryToDelete,
  onConfirm
}: CategoryDeleteDialogProps) {
  const count = selectedCount ?? (categoryToDelete ? 1 : selectedCategories.length)

  return <DeleteConfirmDialog open={open} onOpenChange={onOpenChange} selectedCount={count} onConfirm={onConfirm} />
}
