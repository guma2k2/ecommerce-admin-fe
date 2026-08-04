import { Outlet } from 'react-router'
import { AppSidebar } from '~/shared/components/Sidebar'
import { SidebarProvider, SidebarTrigger } from '~/core/components/shadcn/sidebar'

export default function AuthenticateLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='w-full'>
        {/* <SidebarTrigger /> */}
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
