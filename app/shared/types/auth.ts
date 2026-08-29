export interface AdminProfile {
  userId: string
  email: string
  name: string
  avatar: string | null
  role?: string
}

// User alias for backwards compatibility
export type User = AdminProfile

export interface SignInPayload {
  email: string
  password: string
}

export interface SignInResponseData {
  accessToken: string
}

export interface UpdateProfilePayload {
  name: string
  avatar?: string | null
}

export interface AuthState {
  user: AdminProfile | null
  token: string | null
  isAuthenticated: boolean
  login: (user: AdminProfile, token: string) => void
  setUser: (user: AdminProfile | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export interface LoginResponse {
  user: AdminProfile
  token: string
}

