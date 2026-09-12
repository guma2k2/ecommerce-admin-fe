import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '~/core/components/shadcn/button'
import { useAuthStore } from '~/stores'
import { getAdminProfile, updateAdminProfile } from '~/shared/services/api/authApi'
import { showToast } from '~/shared/utils/toast'
import {
  AccountProfileCard,
  AccountProfileForm,
  type AccountProfileSchema
} from '~/features/authenticate/manageAccount'

export default function ManageAccountPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [avatarPreview, setAvatarPreview] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar || '')
    }
  }, [user])

  const userEmail = user?.email || 'admin@example.com'

  const handleRefreshProfile = async () => {
    try {
      setIsRefreshing(true)
      const freshProfile = await getAdminProfile()
      setUser(freshProfile)
      setAvatarPreview(freshProfile.avatar || '')
      showToast('success', 'Profile data refreshed')
    } catch (error) {
      console.error('Refresh profile error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAvatarChange = useCallback((url: string) => {
    setAvatarPreview(url)
  }, [])

  const handleReset = useCallback(() => {
    setAvatarPreview(user?.avatar || '')
  }, [user?.avatar])

  const handleSaveProfile = async (values: AccountProfileSchema) => {
    try {
      setIsSaving(true)
      const updated = await updateAdminProfile({
        name: values.name.trim(),
        avatar: values.avatar?.trim() || undefined
      })
      setUser(updated)
      setAvatarPreview(updated.avatar || '')
      showToast('success', t('toasts.updatedSuccess', { defaultValue: 'Profile updated successfully' }))
    } catch (error) {
      console.error('Update profile error:', error)
    } finally {
      setIsSaving(false)
    }
  }

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
        <AccountProfileCard user={user} avatarPreview={avatarPreview} />

        {/* Right Column: Edit Profile Form */}
        <div className='lg:col-span-2 space-y-6'>
          <AccountProfileForm
            defaultValues={{
              name: user?.name || '',
              avatar: user?.avatar || ''
            }}
            userEmail={userEmail}
            onSubmit={handleSaveProfile}
            isSubmitting={isSaving}
            onAvatarChange={handleAvatarChange}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  )
}
