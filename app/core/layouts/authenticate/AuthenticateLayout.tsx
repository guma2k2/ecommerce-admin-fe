import { Navigate, Outlet } from 'react-router'
import { AppSidebar } from '~/shared/components/Sidebar'
import { SidebarProvider } from '~/core/components/shadcn/sidebar'
import { useAuthStore } from '~/stores'

export default function AuthenticateLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='w-full'>
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
