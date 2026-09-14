import DeleteConfirmDialog from "~/shared/components/DeleteConfirmDialog"

export interface ProductAttributeTemplateDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount?: number
  selectedTemplates?: unknown[]
  templateToDelete?: unknown | null
  onConfirm: () => Promise<void>
}

export default function ProductAttributeTemplateDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  selectedTemplates = [],
  templateToDelete,
  onConfirm
}: ProductAttributeTemplateDeleteDialogProps) {
  const count = selectedCount ?? (templateToDelete ? 1 : selectedTemplates.length)

  return <DeleteConfirmDialog open={open} onOpenChange={onOpenChange} selectedCount={count} onConfirm={onConfirm} />
}
