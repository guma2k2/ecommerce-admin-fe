import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, AuthState } from '~/shared/types'

export type { User, AuthState }

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
