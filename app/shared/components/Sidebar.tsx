import {
  Award,
  ChevronRight,
  Image,
  FileText,
  FolderKanban,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  User
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router'
import { showToast } from '~/shared/utils/toast'

import LanguageSwitcher from '~/shared/components/LanguageSwitcher'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/core/components/shadcn/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '~/core/components/shadcn/sidebar'
import { useAuthStore } from '~/stores'

interface NavSubItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
}

interface NavItem {
  title: string
  url?: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavSubItem[]
}

export function AppSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    showToast('info', 'toasts.loggedOut')
    navigate('/login', { replace: true })
  }

  const navItems: NavItem[] = [
    {
      title: t('label.dashboard'),
      url: '/admin',
      icon: LayoutDashboard
    },
    {
      title: t('label.catalog'),
      icon: FolderKanban,
      items: [
        {
          title: t('label.manageCategory'),
          url: '/admin/manage-category',
          icon: FolderTree
        },
        {
          title: t('label.manageBrand'),
          url: '/admin/manage-brand',
          icon: Award
        },
        {
          title: t('label.manageProduct'),
          url: '/admin/manage-product',
          icon: Package
        }
      ]
    },
    {
      title: t('label.content'),
      icon: FileText,
      items: [
        {
          title: t('label.manageMedia'),
          url: '/admin/manage-media',
          icon: Image
        }
      ]
    }
  ]

  return (
    <Sidebar collapsible='icon'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('label.application')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                if (!item.items || item.items.length === 0) {
                  const isActive = location.pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link to={item.url || '#'}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                const isGroupActive = item.items.some(
                  (sub) => location.pathname === sub.url || location.pathname.startsWith(sub.url + '/')
                )

                return (
                  <Collapsible key={item.title} asChild defaultOpen={isGroupActive} className='group/collapsible'>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => {
                            const isSubActive =
                              location.pathname === subItem.url || location.pathname.startsWith(subItem.url + '/')
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <Link to={subItem.url}>
                                    {subItem.icon && <subItem.icon />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
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
