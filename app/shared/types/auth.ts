export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export interface LoginResponse {
  user: User
  token: string
}
