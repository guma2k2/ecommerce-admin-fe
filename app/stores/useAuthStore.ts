import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        login: (user, token) =>
          set(
            {
              user,
              token,
              isAuthenticated: true
            },
            false,
            'login'
          ),

        logout: () =>
          set(
            {
              user: null,
              token: null,
              isAuthenticated: false
            },
            false,
            'logout'
          )
      }),
      {
        name: 'auth-storage'
      }
    ),
    { name: 'AuthStore' }
  )
)
