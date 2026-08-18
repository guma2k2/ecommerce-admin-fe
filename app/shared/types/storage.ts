export type CookieSetOptions = {
  path?: string
  expires?: Date
  maxAge?: number
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: boolean | 'none' | 'lax' | 'strict'
  partitioned?: boolean
}

export interface StorageHelperInterface {
  setCookie: (name: string, value: any, options?: CookieSetOptions) => void
  getCookie: (name: string) => any
  removeCookie: (name: string, options?: CookieSetOptions) => Promise<void>
  setLocalItem: (name: string, value: string) => void
  setLocalObject: (name: string, obj: any) => void
  getLocalItem: (name: string) => string | null
  getLocalObject: (name: string) => any
  removeLocalItem: (name: string) => void
  setSessionItem: (name: string, value: string) => void
  setSessionObject: (name: string, obj: any) => void
  getSessionItem: (name: string) => string | null
  getSessionObject: (name: string) => any
  removeSessionItem: (name: string) => void
}
