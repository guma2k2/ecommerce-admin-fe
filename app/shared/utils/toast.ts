import { toast } from 'sonner'
import i18n from '~/shared/i18n'
import type { ToastType } from '~/shared/types'

export type { ToastType }

export function showToast(type: ToastType, message: string): void {
  const translatedMessage = i18n.t(message, { defaultValue: message })
  switch (type) {
    case 'success':
      toast.success(translatedMessage)
      break
    case 'error':
      toast.error(translatedMessage)
      break
    case 'info':
      toast.info(translatedMessage)
      break
  }
}

export default showToast
