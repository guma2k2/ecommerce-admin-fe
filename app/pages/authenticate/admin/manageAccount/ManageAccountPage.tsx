import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  User as UserIcon,
  Mail,
  Shield,
  Hash,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Save,
  KeyRound,
  CheckCircle2,
  Lock,
  Camera,
  AlertCircle
} from 'lucide-react'
import { Button } from '~/core/components/shadcn/button'
import { Input } from '~/core/components/shadcn/input'
import { Badge } from '~/core/components/shadcn/badge'
import { Separator } from '~/core/components/shadcn/separator'
import { useAuthStore } from '~/stores'
import { getAdminProfile, updateAdminProfile } from '~/shared/services/api/authApi'
import { showToast } from '~/shared/utils/toast'

export default function ManageAccountPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setAvatar(user.avatar || '')
      setAvatarError(false)
    }
  }, [user])

  const userId = user?.userId || (user as any)?.id || 'N/A'
  const userEmail = user?.email || 'admin@example.com'
  const userRole = user?.role || 'SYSTEM ADMIN'

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

  const handleRefreshProfile = async () => {
    try {
      setIsRefreshing(true)
      const freshProfile = await getAdminProfile()
      setUser(freshProfile)
      setName(freshProfile.name || '')
      setAvatar(freshProfile.avatar || '')
      showToast('success', 'Profile data refreshed')
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to refresh profile'
      showToast('error', msg)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

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
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update profile'
      showToast('error', msg)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = (user?.name || '') !== name.trim() || (user?.avatar || '') !== avatar.trim()

  return (
    <div className='w-full min-h-screen bg-gray-50/60 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8 space-y-8'>
      {/* Header Banner */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-6 sm:p-8 text-white shadow-lg'>
        <div className='relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='space-y-2 max-w-2xl'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur'>
              <Sparkles className='size-3.5 text-amber-400' />
              <span>Admin Profile & Settings</span>
            </div>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
              {t('label.accountTitle', { defaultValue: 'Account Management' })}
            </h1>
            <p className='text-zinc-300 text-sm leading-relaxed'>
              {t('label.accountSubtitle', {
                defaultValue: 'Manage your administrator account credentials, personal information, and session details.'
              })}
            </p>
          </div>

          <Button
            variant='outline'
            onClick={handleRefreshProfile}
            disabled={isRefreshing}
            className='self-start sm:self-center bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur cursor-pointer'
          >
            <RefreshCw className={`size-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8'>
        {/* Left Column: Profile Card & Quick Info */}
        <div className='space-y-6'>
          {/* Identity Card */}
          <div className='rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-6'>
            <div className='flex flex-col items-center text-center space-y-4'>
              <div className='relative group'>
                <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden border-4 border-primary/20 shadow-inner shrink-0'>
                  {avatar && !avatarError ? (
                    <img
                      src={avatar}
                      alt={name || 'Avatar'}
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
                  {name || 'Administrator'}
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
                  <button
                    type='button'
                    onClick={handleCopyId}
                    className='p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer'
                    title='Copy User ID'
                  >
                    {copied ? <Check className='size-3.5 text-emerald-600' /> : <Copy className='size-3.5' />}
                  </button>
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

        {/* Right Column: Edit Profile Form & Settings */}
        <div className='lg:col-span-2 space-y-6'>
          <form
            onSubmit={handleSaveProfile}
            className='rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs space-y-8'
          >
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-bold text-gray-900 dark:text-gray-100'>Profile Details</h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Update your public display name and avatar URL.
                </p>
              </div>
              <KeyRound className='size-5 text-muted-foreground' />
            </div>

            <Separator className='bg-gray-100 dark:bg-zinc-800' />

            <div className='space-y-6'>
              {/* Display Name Input */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between'>
                  <span>{t('label.name')}</span>
                  <span className='text-xs font-normal text-muted-foreground'>Required</span>
                </label>
                <div className='relative'>
                  <UserIcon className='absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='e.g. John Doe'
                    className='pl-10 h-11 text-sm'
                    disabled={isSaving}
                    required
                  />
                </div>
                <p className='text-xs text-muted-foreground'>
                  This name will appear in top navigation, activity records, and greeting headers.
                </p>
              </div>

              {/* Avatar URL Input */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between'>
                  <span>Avatar Image URL</span>
                  <span className='text-xs font-normal text-muted-foreground'>Optional</span>
                </label>
                <div className='relative'>
                  <Camera className='absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                  <Input
                    value={avatar}
                    onChange={(e) => {
                      setAvatar(e.target.value)
                      setAvatarError(false)
                    }}
                    placeholder='https://images.unsplash.com/...'
                    className='pl-10 h-11 text-sm'
                    disabled={isSaving}
                  />
                </div>
                <p className='text-xs text-muted-foreground'>
                  Provide a direct HTTPS link to an image (PNG, JPG, SVG, WebP).
                </p>
              </div>

              {/* Readonly Email Field */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between'>
                  <span>{t('label.email')}</span>
                  <span className='text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1'>
                    <AlertCircle className='size-3' /> Read-only
                  </span>
                </label>
                <div className='relative'>
                  <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                  <Input
                    value={userEmail}
                    readOnly
                    disabled
                    className='pl-10 h-11 text-sm bg-gray-100/70 dark:bg-zinc-800/60 cursor-not-allowed text-muted-foreground'
                  />
                </div>
                <p className='text-xs text-muted-foreground'>
                  Email address is linked to your primary login credentials and cannot be changed here.
                </p>
              </div>
            </div>

            <Separator className='bg-gray-100 dark:bg-zinc-800' />

            {/* Actions */}
            <div className='flex items-center justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                disabled={!hasChanges || isSaving}
                onClick={() => {
                  setName(user?.name || '')
                  setAvatar(user?.avatar || '')
                  setAvatarError(false)
                }}
                className='cursor-pointer'
              >
                Reset
              </Button>

              <Button
                type='submit'
                disabled={!hasChanges || isSaving}
                className='cursor-pointer min-w-[130px]'
              >
                {isSaving ? (
                  <>
                    <RefreshCw className='size-4 mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='size-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
