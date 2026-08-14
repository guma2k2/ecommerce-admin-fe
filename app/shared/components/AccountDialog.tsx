import { useTranslation } from 'react-i18next'
import { Mail, Shield, User as UserIcon, Hash } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/core/components/shadcn/dialog'
import { Badge } from '~/core/components/shadcn/badge'
import { Button } from '~/core/components/shadcn/button'
import { useAuthStore } from '~/stores'

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl font-semibold'>
            <UserIcon className='w-5 h-5 text-primary' />
            {t('label.accountTitle')}
          </DialogTitle>
          <DialogDescription>{t('label.accountSubtitle')}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-6 py-4'>
          {/* Avatar and Basic Header */}
          <div className='flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800'>
            <div className='w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden border-2 border-primary/20 shrink-0'>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
              ) : (
                <UserIcon className='w-8 h-8 text-primary' />
              )}
            </div>
            <div className='flex flex-col gap-1 overflow-hidden'>
              <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100 truncate'>{user.name}</h3>
              <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
              <div className='pt-1'>
                <Badge variant='outline' className='text-xs uppercase tracking-wider font-semibold border-primary/30 text-primary bg-primary/5'>
                  {user.role || 'ADMIN'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Account Detail Fields */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <UserIcon className='w-4 h-4' />
                <span>{t('label.name')}</span>
              </div>
              <span className='font-medium text-gray-900 dark:text-gray-100'>{user.name}</span>
            </div>

            <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Mail className='w-4 h-4' />
                <span>{t('label.email')}</span>
              </div>
              <span className='font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]'>{user.email}</span>
            </div>

            <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Shield className='w-4 h-4' />
                <span>{t('label.role')}</span>
              </div>
              <span className='font-medium text-gray-900 dark:text-gray-100'>{user.role}</span>
            </div>

            <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Hash className='w-4 h-4' />
                <span>{t('label.userId')}</span>
              </div>
              <span className='font-mono text-xs text-muted-foreground'>{user.id}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} className='w-full sm:w-auto cursor-pointer'>
            {t('label.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AccountDialog
