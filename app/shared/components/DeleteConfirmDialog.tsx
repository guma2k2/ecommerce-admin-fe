import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/core/components/shadcn/dialog"
import { Button } from "~/core/components/shadcn/button"

export interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  onConfirm: () => Promise<void>
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Error handling managed by parent toast/mutation
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
      <DialogContent className='sm:max-w-[420px]'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0'>
              <AlertTriangle className='size-5' />
            </div>
            <div>
              <DialogTitle className='text-lg'>Delete</DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground mt-0.5'>
                Are you sure you want to delete{" "}
                <span className='font-semibold text-gray-900 dark:text-white'>{selectedCount}</span> selected{" "}
                {selectedCount === 1 ? "item" : "items"}?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className='gap-2 sm:gap-0 mt-4'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {t("button.cancel", "Cancel")}
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleConfirm}
            disabled={isDeleting || selectedCount === 0}
            className='gap-2 bg-red-600 hover:bg-red-700 text-white'
          >
            {isDeleting && <Loader2 className='size-4 animate-spin' />}
            {t("button.delete", "Delete")} {selectedCount > 0 ? `(${selectedCount})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
