import { toast } from 'sonner'
import i18n from '~/shared/i18n'

export type ToastType = 'success' | 'error' | 'info'

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
