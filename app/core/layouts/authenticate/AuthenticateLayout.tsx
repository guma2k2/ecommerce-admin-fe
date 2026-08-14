import { Navigate, Outlet } from 'react-router'
import { AppSidebar } from '~/shared/components/Sidebar'
import { Header } from '~/shared/components/Header'
import { SidebarInset, SidebarProvider } from '~/core/components/shadcn/sidebar'
import { useAuthStore } from '~/stores'

export default function AuthenticateLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className='flex-1 w-full min-h-[calc(100vh-4rem)]'>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
