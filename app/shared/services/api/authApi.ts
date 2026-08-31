import apiClient, { setAccessToken } from '~/shared/services/axiosClient'
import type {
  AdminProfile,
  ApiResponse,
  SignInPayload,
  SignInResponseData,
  UpdateProfilePayload
} from '~/shared/types'

export type { AdminProfile, SignInPayload, UpdateProfilePayload }

/**
 * Authenticates user credentials and sets the Access Token.
 * Refresh Token cookie is automatically set by the server.
 */
export async function signIn(payload: SignInPayload): Promise<string> {
  const response = await apiClient.post<ApiResponse<SignInResponseData>>(
    '/auth/public/sign-in',
    payload
  )
  const token = response.data.data.accessToken
  setAccessToken(token)
  return token
}

/**
 * Exchanges valid HttpOnly refresh token cookie for a new Access Token.
 */
export async function refreshToken(): Promise<string> {
  const response = await apiClient.post<ApiResponse<string | SignInResponseData>>(
    '/auth/public/refresh'
  )
  const data = response.data.data
  const token = typeof data === 'string' ? data : data.accessToken
  setAccessToken(token)
  return token
}


/**
 * Revokes refresh token in backend and clears client session.
 */
export async function signOut(): Promise<void> {
  try {
    await apiClient.post('/auth/sign-out')
  } finally {
    setAccessToken(null)
  }
}

/**
 * Retrieves profile details of the authenticated administrator.
 */
export async function getAdminProfile(): Promise<AdminProfile> {
  const response = await apiClient.get<ApiResponse<AdminProfile>>(
    '/admin-profile/my-profile'
  )
  return response.data.data
}

/**
 * Updates the name and/or avatar of the authenticated administrator.
 */
export async function updateAdminProfile(
  payload: UpdateProfilePayload
): Promise<AdminProfile> {
  const response = await apiClient.put<ApiResponse<AdminProfile>>(
    '/admin-profile/my-profile',
    payload
  )
  return response.data.data
}

