import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '~/stores'

export default function UnAuthenticateLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to='/admin' replace />
  }

  return <Outlet />
}
