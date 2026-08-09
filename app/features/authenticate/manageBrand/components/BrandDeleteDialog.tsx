import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import type { BrandItem } from "../services/brandService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/core/components/shadcn/dialog"
import { Button } from "~/core/components/shadcn/button"

interface BrandDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandToDelete: BrandItem | null
  onConfirm: () => Promise<void>
}

export default function BrandDeleteDialog({
  open,
  onOpenChange,
  brandToDelete,
  onConfirm,
}: BrandDeleteDialogProps) {
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
              <DialogTitle className="text-lg">Delete Brand</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {brandToDelete && (
          <div className="py-2 flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
            {brandToDelete.image && (
              <img
                src={brandToDelete.image}
                alt={brandToDelete.name}
                className="w-10 h-10 rounded-md object-contain border border-gray-200 dark:border-zinc-700 bg-white p-0.5 shrink-0"
              />
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete brand{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                "{brandToDelete.name}"
              </span>
              ?
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
            Delete Brand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
