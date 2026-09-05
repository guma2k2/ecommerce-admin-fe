import {
  Award,
  ChevronRight,
  Component,
  Image,
  FileText,
  FolderKanban,
  FolderTree,
  LayoutDashboard,
  Package,
  SlidersHorizontal,
  Store,
  Tags
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/core/components/shadcn/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
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
import { cn } from '~/shared/utils/appUtils'

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
  const location = useLocation()

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
          title: t('label.category'),
          url: '/admin/manage-category',
          icon: FolderTree
        },
        {
          title: t('label.brand'),
          url: '/admin/manage-brand',
          icon: Award
        },
        {
          title: t('label.productAttribute'),
          url: '/admin/manage-product-attribute',
          icon: Tags
        },
        {
          title: t('label.productAttributeTemplate'),
          url: '/admin/manage-product-attribute-template',
          icon: SlidersHorizontal
        },
        {
          title: t('label.productOption'),
          url: '/admin/manage-product-option',
          icon: Component
        },
        {
          title: t('label.product'),
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
          title: t('label.media'),
          url: '/admin/manage-media',
          icon: Image
        }
      ]
    }
  ]

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='h-16 justify-center border-b border-sidebar-border px-3.5 group-data-[collapsible=icon]:px-0'>
        <Link
          to='/admin'
          className='flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-md'
        >
          <div className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs shrink-0'>
            <Store className='size-4.5' />
          </div>
          <div className='flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden'>
            <span className='font-bold text-sm text-sidebar-foreground truncate'>E-Commerce</span>
            <span className='text-[11px] text-muted-foreground truncate'>Admin Dashboard</span>
          </div>
        </Link>
      </SidebarHeader>

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
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isGroupActive}
                          className={cn(
                            'transition-colors',
                            isGroupActive &&
                              'font-medium text-sidebar-foreground data-[active=true]:bg-transparent data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-none data-[active=true]:[&>svg]:text-sidebar-foreground group-data-[collapsible=icon]:data-[active=true]:bg-primary group-data-[collapsible=icon]:data-[active=true]:text-primary-foreground group-data-[collapsible=icon]:data-[active=true]:[&>svg]:text-primary-foreground'
                          )}
                        >
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
    </Sidebar>
  )
}

export default AppSidebar
