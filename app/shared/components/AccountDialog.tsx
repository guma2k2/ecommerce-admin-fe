import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Shield, User as UserIcon, Hash, Edit2, Check, X, Loader2 } from 'lucide-react'
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
import { Input } from '~/core/components/shadcn/input'
import { useAuthStore } from '~/stores'
import { updateAdminProfile } from '~/shared/services/api/authApi'
import { showToast } from '~/shared/utils/toast'

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setAvatar(user.avatar || '')
    }
  }, [user, open])

  if (!user) return null

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('error', 'Name cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      const updated = await updateAdminProfile({
        name: name.trim(),
        avatar: avatar.trim() || undefined
      })
      setUser(updated)
      showToast('success', 'Profile updated successfully')
      setIsEditing(false)
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update profile'
      showToast('error', msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setName(user.name || '')
    setAvatar(user.avatar || '')
    setIsEditing(false)
  }

  const userId = user.userId || (user as any).id || 'N/A'

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
            {isEditing ? (
              <>
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-muted-foreground'>{t('label.name')}</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Enter full name'
                    disabled={isSaving}
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-muted-foreground'>Avatar URL</label>
                  <Input
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder='https://example.com/avatar.png'
                    disabled={isSaving}
                  />
                </div>
              </>
            ) : (
              <>
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
                  <span className='font-medium text-gray-900 dark:text-gray-100'>{user.role || 'ADMIN'}</span>
                </div>

                <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 text-sm'>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <Hash className='w-4 h-4' />
                    <span>{t('label.userId')}</span>
                  </div>
                  <span className='font-mono text-xs text-muted-foreground'>{userId}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          {isEditing ? (
            <div className='flex items-center justify-end gap-2 w-full'>
              <Button variant='outline' onClick={handleCancel} disabled={isSaving} className='cursor-pointer'>
                <X className='w-4 h-4 mr-1' />
                {t('button.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className='cursor-pointer'>
                {isSaving ? <Loader2 className='w-4 h-4 mr-1 animate-spin' /> : <Check className='w-4 h-4 mr-1' />}
                {t('button.save')}
              </Button>
            </div>
          ) : (
            <div className='flex items-center justify-between w-full'>
              <Button variant='outline' onClick={() => setIsEditing(true)} className='cursor-pointer'>
                <Edit2 className='w-4 h-4 mr-1' />
                {t('button.edit')}
              </Button>
              <Button variant='outline' onClick={() => onOpenChange(false)} className='cursor-pointer'>
                {t('label.close')}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AccountDialog

