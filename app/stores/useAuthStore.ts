import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { AdminProfile, AuthState } from '~/shared/types'
import { setAccessToken } from '~/shared/services/axiosClient'

export type { AdminProfile, AuthState }

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        login: (user, token) => {
          setAccessToken(token)
          set(
            {
              user,
              token,
              isAuthenticated: true
            },
            false,
            'login'
          )
        },

        setUser: (user) =>
          set(
            {
              user
            },
            false,
            'setUser'
          ),

        setToken: (token) => {
          setAccessToken(token)
          set(
            {
              token,
              isAuthenticated: Boolean(token)
            },
            false,
            'setToken'
          )
        },

        logout: () => {
          setAccessToken(null)
          set(
            {
              user: null,
              token: null,
              isAuthenticated: false
            },
            false,
            'logout'
          )
        }
      }),
      {
        name: 'auth-storage',
        onRehydrateStorage: () => (state) => {
          if (state?.token) {
            setAccessToken(state.token)
          }
        }
      }
    ),
    { name: 'AuthStore' }
  )
)

