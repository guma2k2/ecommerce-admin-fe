import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { SidebarTrigger } from '~/core/components/shadcn/sidebar'
import { Separator } from '~/core/components/shadcn/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/core/components/shadcn/dropdown-menu'
import { Button } from '~/core/components/shadcn/button'
import LanguageSwitcher from '~/shared/components/LanguageSwitcher'
import { useAuthStore } from '~/stores'
import { showToast } from '~/shared/utils/toast'
import { signOut } from '~/shared/services/api/authApi'

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    try {
      await signOut()
    } catch {
      // Still logout locally if request fails
    } finally {
      logout()
      showToast('info', 'toasts.loggedOut')
      navigate('/login', { replace: true })
    }
  }

  const displayName = user?.name || 'Admin'

  return (
    <header className='sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 px-4 sm:px-6 backdrop-blur transition-all'>
      {/* Left Side: Sidebar Toggle and Breadcrumb / Title */}
      <div className='flex items-center gap-3'>
        <SidebarTrigger className='cursor-pointer text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors' />
        <Separator orientation='vertical' className='h-5 hidden sm:block bg-gray-200 dark:bg-zinc-800' />
        <div className='hidden sm:flex items-center text-sm font-medium text-muted-foreground'>
          <span>Admin Portal</span>
        </div>
      </div>

      {/* Right Side: Language Switcher and User Dropdown */}
      <div className='flex items-center gap-3 sm:gap-4'>
        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex items-center gap-2 px-2.5 sm:px-3 py-1.5 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-zinc-800 focus-visible:ring-1'
            >
              <div className='w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden border border-primary/20 shrink-0'>
                {user?.avatar ? (
                  <img src={user.avatar} alt={displayName} className='w-full h-full object-cover' />
                ) : (
                  <UserIcon className='w-4 h-4' />
                )}
              </div>
              <span className='text-sm font-semibold text-gray-800 dark:text-gray-200 tracking-tight'>
                {t('label.hello', { name: displayName })}
              </span>
              <ChevronDown className='w-4 h-4 text-muted-foreground transition-transform duration-200' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-56 p-1.5 shadow-lg border border-gray-200 dark:border-zinc-800'>
            <DropdownMenuLabel className='font-normal px-2 py-1.5'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-semibold leading-none text-gray-900 dark:text-gray-100 truncate'>
                  {displayName}
                </p>
                <p className='text-xs leading-none text-muted-foreground truncate'>
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className='my-1 bg-gray-100 dark:bg-zinc-800' />

            <DropdownMenuItem
              onClick={() => navigate('/admin/account')}
              className='cursor-pointer flex items-center gap-2 px-2.5 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors'
            >
              <UserIcon className='w-4 h-4 text-gray-500 dark:text-gray-400' />
              <span className='font-medium'>{t('label.account')}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className='my-1 bg-gray-100 dark:bg-zinc-800' />

            <DropdownMenuItem
              onClick={handleLogout}
              className='cursor-pointer flex items-center gap-2 px-2.5 py-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-400 transition-colors'
            >
              <LogOut className='w-4 h-4 text-red-600 dark:text-red-400' />
              <span className='font-medium'>{t('label.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header

