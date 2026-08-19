import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductAttributeItem } from '~/shared/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/core/components/shadcn/dialog'
import { Button } from '~/core/components/shadcn/button'

interface ProductAttributeDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attributeToDelete: ProductAttributeItem | null
  onConfirm: () => Promise<void>
}

export default function ProductAttributeDeleteDialog({
  open,
  onOpenChange,
  attributeToDelete,
  onConfirm
}: ProductAttributeDeleteDialogProps) {
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Handled by caller
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
              <DialogTitle className='text-lg'>
                {t('productAttribute.deleteTitle')}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                {t('productAttribute.cannotBeUndone')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {attributeToDelete && (
          <div className='py-2 flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-gray-100 dark:border-zinc-800'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {t('productAttribute.deleteConfirmation', { name: attributeToDelete.name })}
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
            {t('productAttribute.deleteAttribute')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
