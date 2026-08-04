import { Calendar, Home, Search, Settings, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

export function AppSidebar() {
  const { t } = useTranslation()

  const items = [
    {
      title: t('label.dashboard'),
      url: '#',
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
      <SidebarFooter className='p-3'>
        <LanguageSwitcher />
      </SidebarFooter>
    </Sidebar>
  )
}

