import { Calendar, Home, LogOut, Search, Settings, Tag, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import LanguageSwitcher from '~/shared/components/LanguageSwitcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '~/core/components/shadcn/sidebar'
import { useAuthStore } from '~/stores'

export function AppSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully')
    navigate('/login', { replace: true })
  }

  const items = [
    {
      title: t('label.dashboard'),
      url: '/admin',
      icon: Home
    },
    {
      title: t('label.product'),
      url: '/admin/manage-product',
      icon: Tag
    },
    {
      title: t('label.calendar'),
      url: '#',
      icon: Calendar
    },
    {
      title: t('label.search'),
      url: '#',
      icon: Search
    },
    {
      title: t('label.settings'),
      url: '#',
      icon: Settings
    }
  ]

  return (
    <Sidebar collapsible='icon'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('label.application')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url + item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='p-3 flex flex-col gap-2'>
        {user && (
          <div className='flex items-center gap-2 px-2 py-1.5 text-xs text-sidebar-foreground border-b pb-2 mb-1'>
            <div className='w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0'>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
              ) : (
                <User className='w-4 h-4' />
              )}
            </div>
            <div className='flex flex-col overflow-hidden text-left'>
              <span className='font-medium truncate'>{user.name}</span>
              <span className='text-[10px] text-muted-foreground truncate'>{user.email}</span>
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className='cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50'>
              <LogOut className='w-4 h-4' />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <LanguageSwitcher />
      </SidebarFooter>
    </Sidebar>
  )
}
