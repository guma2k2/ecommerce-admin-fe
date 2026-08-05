import { Navigate } from 'react-router'
import { useAuthStore } from '~/stores'

export default function IndexPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  return <Navigate to='/admin' replace />
}
