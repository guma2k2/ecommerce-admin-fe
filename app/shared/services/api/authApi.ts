import type { LoginFormSchema } from '~/features/unAuthenticate/validator'
import type { User, LoginResponse } from '~/shared/types'

export type { LoginResponse }

/**
 * Simulates a fake backend API call for user authentication.
 * Returns user details and a dummy JWT token after 1 second.
 */
export async function fakeLoginApi(credentials: LoginFormSchema): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simple validation logic for testing error state if needed
      if (credentials.email.includes('error')) {
        reject(new Error('Invalid email or password.'))
        return
      }

      const mockUser: User = {
        id: 'usr_1001',
        email: credentials.email,
        name: credentials.email.split('@')[0] || 'Admin User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: 'ADMIN'
      }

      const mockToken = `mock-jwt-token-${Date.now()}`

      resolve({
        user: mockUser,
        token: mockToken
      })
    }, 1000)
  })
}
