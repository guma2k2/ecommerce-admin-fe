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
 * Split ISO datetime into formatted date and time strings.
 */
export function formatDateParts(isoString?: string | null): { dateStr: string; timeStr: string } {
  if (!isoString) return { dateStr: '-', timeStr: '' }
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return { dateStr: isoString, timeStr: '' }
    const dateStr = d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    })
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return { dateStr, timeStr }
  } catch {
    return { dateStr: isoString, timeStr: '' }
  }
}

/**
 * Checks if a URL or filename represents a video.
 */
export function isVideoUrl(url?: string): boolean {
  if (!url) return false
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase()
  return ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.webm', '.m4v', '.3gp', '.ts', '.mpg', '.mpeg'].some(
    (ext) => cleanUrl.endsWith(ext)
  )
}

/**
 * Format duration in seconds to mm:ss or hh:mm:ss.
 */
export function formatDuration(duration: number | string | null | undefined): string {
  if (duration === null || duration === undefined) return ''
  const sec = typeof duration === 'string' ? parseFloat(duration) : duration
  if (isNaN(sec) || sec <= 0) {
    if (typeof duration === 'string' && duration.includes(':')) return duration
    return ''
  }
  const totalSeconds = Math.floor(sec)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Checks if media is an image.
 */
export function isImageMedia(media: { type?: string; fileType?: string; url?: string; name?: string }): boolean {
  if (!media) return false
  if (media.type === 'IMAGE') return true
  const mime = (media.type || '').toLowerCase()
  const ext = (media.fileType || '').toLowerCase()
  if (
    mime.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp', 'ico', 'avif', 'heic', 'heif'].includes(ext)
  ) {
    return true
  }
  if (media.url) {
    const cleanUrl = media.url.split('?')[0].split('#')[0].toLowerCase()
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif'].some((e) => cleanUrl.endsWith(e))) return true
  }
  if (media.name) {
    const cleanName = media.name.toLowerCase()
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif'].some((e) => cleanName.endsWith(e))) return true
  }
  return false
}

/**
 * Checks if media is a video.
 */
export function isVideoMedia(media: { type?: string; fileType?: string; url?: string; name?: string }): boolean {
  if (!media) return false
  if (media.type === 'VIDEO') return true
  const mime = (media.type || '').toLowerCase()
  const ext = (media.fileType || '').toLowerCase()
  if (
    mime.startsWith('video/') ||
    ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm', 'm4v', '3gp', 'ts', 'mpg', 'mpeg'].includes(ext)
  ) {
    return true
  }
  if (media.url && isVideoUrl(media.url)) return true
  if (media.name && isVideoUrl(media.name)) return true
  return false
}

/**
 * Formats a validation translation key and optional interpolation params into a message string for Zod.
 */
export function validationMsg(key: string, params?: Record<string, unknown>): string {
  return params ? JSON.stringify({ key, ...params }) : key
}
