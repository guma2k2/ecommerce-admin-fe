import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import type { CategoryItem } from "../services/categoryService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/core/components/shadcn/dialog"
import { Button } from "~/core/components/shadcn/button"

interface CategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryToDelete: CategoryItem | null
  onConfirm: () => Promise<void>
}

export default function CategoryDeleteDialog({
  open,
  onOpenChange,
  categoryToDelete,
  onConfirm,
}: CategoryDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Handled by parent toast/error state
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Delete Category</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {categoryToDelete && (
          <div className="py-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete category{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                "{categoryToDelete.name}"
              </span>{" "}
              <span className="font-mono text-xs text-gray-500">({categoryToDelete.id})</span>?
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            Delete Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
