import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BrandItem } from '~/shared/services/api/brandService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/core/components/shadcn/dialog'
import { Button } from '~/core/components/shadcn/button'

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
  onConfirm
}: BrandDeleteDialogProps) {
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)

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
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0'>
              <AlertTriangle className='size-5' />
            </div>
            <div>
              <DialogTitle className='text-lg'>{t('brand.deleteTitle')}</DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                {t('brand.cannotBeUndone')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {brandToDelete && (
          <div className='py-2 flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-gray-100 dark:border-zinc-800'>
            {brandToDelete.image && (
              <img
                src={brandToDelete.image}
                alt={brandToDelete.name}
                className='w-10 h-10 rounded-md object-contain border border-gray-200 dark:border-zinc-700 bg-white p-0.5 shrink-0'
              />
            )}
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {t('brand.deleteConfirmation', { name: brandToDelete.name })}
            </p>
          </div>
        )}

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t('button.cancel')}
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleConfirm}
            disabled={isDeleting}
            className='gap-2 bg-red-600 hover:bg-red-700 text-white'
          >
            {isDeleting && <Loader2 className='size-4 animate-spin' />}
            {t('brand.deleteBrand')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
