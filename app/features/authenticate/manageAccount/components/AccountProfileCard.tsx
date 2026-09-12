import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  User as UserIcon,
  Mail,
  Shield,
  Hash,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  Camera
} from 'lucide-react'

import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import { Separator } from '~/core/components/shadcn/separator'
import { showToast } from '~/shared/utils/toast'
import { cn } from '~/shared/utils/appUtils'
import type { AdminProfile } from '~/shared/types'

export interface AccountProfileCardProps {
  user: AdminProfile | null
  avatarPreview?: string
  className?: string
}

export default function AccountProfileCard({
  user,
  avatarPreview,
  className
}: AccountProfileCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const activeAvatar = avatarPreview !== undefined ? avatarPreview : user?.avatar || ''

  useEffect(() => {
    setAvatarError(false)
  }, [activeAvatar])

  const userId = user?.userId || 'N/A'
  const userEmail = user?.email || 'admin@example.com'
  const userRole = user?.role || 'SYSTEM ADMIN'
  const userName = user?.name || 'Administrator'

  const handleCopyId = async () => {
    if (!userId || userId === 'N/A') return
    try {
      await navigator.clipboard.writeText(userId)
      setCopied(true)
      showToast('info', 'User ID copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('error', 'Failed to copy ID')
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Identity Card */}
      <div className='rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-6'>
        <div className='flex flex-col items-center text-center space-y-4'>
          <div className='relative group'>
            <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden border-4 border-primary/20 shadow-inner shrink-0'>
              {activeAvatar && !avatarError ? (
                <img
                  src={activeAvatar}
                  alt={userName}
                  className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <UserIcon className='w-12 h-12 text-primary' />
              )}
            </div>
            <div className='absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-md border-2 border-white dark:border-zinc-900'>
              <Camera className='size-3.5' />
            </div>
          </div>

          <div className='space-y-1 w-full'>
            <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100 truncate'>
              {userName}
            </h2>
            <p className='text-sm text-muted-foreground truncate'>{userEmail}</p>
            <div className='pt-2 flex items-center justify-center gap-2'>
              <Badge
                variant='outline'
                className='uppercase text-xs font-semibold px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5 tracking-wider'
              >
                {userRole}
              </Badge>
              <span className='inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50'>
                <CheckCircle2 className='size-3' /> Active
              </span>
            </div>
          </div>
        </div>

        <Separator className='bg-gray-100 dark:bg-zinc-800' />

        {/* Quick Details List */}
        <div className='space-y-3 text-sm'>
          <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50/70 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/80'>
            <div className='flex items-center gap-2.5 text-muted-foreground'>
              <Hash className='size-4 text-gray-500' />
              <span className='font-medium text-xs uppercase tracking-wider'>{t('label.userId')}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='font-mono text-xs text-gray-700 dark:text-gray-300 max-w-[120px] truncate'>
                {userId}
              </span>
              <Button
                type='button'
                variant='ghost'
                size='icon-xs'
                onClick={handleCopyId}
                className='text-muted-foreground hover:text-gray-900 dark:hover:text-white cursor-pointer'
                title='Copy User ID'
              >
                {copied ? <Check className='size-3.5 text-emerald-600' /> : <Copy className='size-3.5' />}
              </Button>
            </div>
          </div>

          <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50/70 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/80'>
            <div className='flex items-center gap-2.5 text-muted-foreground'>
              <Mail className='size-4 text-gray-500' />
              <span className='font-medium text-xs uppercase tracking-wider'>{t('label.email')}</span>
            </div>
            <span className='font-medium text-xs text-gray-800 dark:text-gray-200 truncate max-w-[150px]'>
              {userEmail}
            </span>
          </div>

          <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50/70 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/80'>
            <div className='flex items-center gap-2.5 text-muted-foreground'>
              <Shield className='size-4 text-gray-500' />
              <span className='font-medium text-xs uppercase tracking-wider'>{t('label.role')}</span>
            </div>
            <span className='font-medium text-xs text-gray-800 dark:text-gray-200'>{userRole}</span>
          </div>
        </div>
      </div>

      {/* Session & Security Info Card */}
      <div className='rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4'>
        <div className='flex items-center gap-2.5 text-gray-900 dark:text-gray-100 font-semibold text-sm'>
          <Lock className='size-4 text-primary' />
          <span>Authentication & Security</span>
        </div>

        <div className='space-y-3 text-xs text-muted-foreground'>
          <div className='flex items-start gap-2.5'>
            <CheckCircle2 className='size-4 text-emerald-500 shrink-0 mt-0.5' />
            <span>
              <strong className='text-gray-800 dark:text-gray-200 font-medium'>JWT Access Token</strong>: Attached
              to API requests via Bearer authorization.
            </span>
          </div>
          <div className='flex items-start gap-2.5'>
            <CheckCircle2 className='size-4 text-emerald-500 shrink-0 mt-0.5' />
            <span>
              <strong className='text-gray-800 dark:text-gray-200 font-medium'>HttpOnly Cookie</strong>: Refresh
              token is stored in a secure browser cookie.
            </span>
          </div>
          <div className='flex items-start gap-2.5'>
            <CheckCircle2 className='size-4 text-emerald-500 shrink-0 mt-0.5' />
            <span>
              <strong className='text-gray-800 dark:text-gray-200 font-medium'>Silent Token Refresh</strong>:
              Automatically re-authenticates expired sessions.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
