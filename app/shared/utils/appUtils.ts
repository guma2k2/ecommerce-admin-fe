import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import snakecaseKeys from 'snakecase-keys'
import camelcaseKeys from 'camelcase-keys'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSnakeCase<T extends Record<string, unknown>>(obj: T): T {
  if (obj instanceof FormData) {
    return obj
  }

  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as unknown as T
  }

  return snakecaseKeys(obj, { deep: true }) as T
}

export function toCamelCase<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase) as unknown as T
  }

  return camelcaseKeys(obj, { deep: true }) as T
}

export function isValidUrl(url: string) {
  return /^https?:\/\/\S+$/.test(url)
}

export function getUrlFromString(str: string) {
  if (isValidUrl(str)) {
    return str
  }
  try {
    if (str.includes('.') && !str.includes(' ')) {
      return new URL(`https://${str}`).toString()
    }
  } catch {
    return null
  }
}

export function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>((acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])), [[]])
}

/**
 * Converts a text string to a URL-friendly slug.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Extracts and formats the file extension or type descriptor.
 */
export function getFileExtension(name: string, type?: string): string {
  if (type) {
    if (type.startsWith('image/jpeg')) return 'JPG'
    if (type.startsWith('image/png')) return 'PNG'
    if (type.startsWith('image/webp')) return 'WEBP'
    if (type.startsWith('video/')) return 'MP4'
    if (type.includes('pdf')) return 'PDF'
  }
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE'
}

/**
 * Format bytes into human-readable size string.
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format ISO datetime string for display.
 */
export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '-'
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return isoString
  }
}

/**
 * Checks if media is an image.
 */
export function isImageMedia(media: { type?: string; fileType?: string }): boolean {
  if (!media) return false
  if (media.type === 'IMAGE') return true
  const mime = (media.type || '').toLowerCase()
  const ext = (media.fileType || '').toLowerCase()
  return (
    mime.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp', 'ico', 'avif', 'heic', 'heif'].includes(ext)
  )
}

/**
 * Checks if media is a video.
 */
export function isVideoMedia(media: { type?: string; fileType?: string }): boolean {
  if (!media) return false
  if (media.type === 'VIDEO') return true
  const mime = (media.type || '').toLowerCase()
  const ext = (media.fileType || '').toLowerCase()
  return (
    mime.startsWith('video/') ||
    ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm', 'm4v', '3gp', 'ts', 'mpg', 'mpeg'].includes(ext)
  )
}
