import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/core/components/shadcn/select'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value)
  }

  const currentLanguage = i18n.language ? i18n.language.slice(0, 2) : 'en'

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger size='sm' className='w-[140px]'>
        <Globe className='h-4 w-4 mr-1' />
        <SelectValue placeholder='Language' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='en'>English</SelectItem>
        <SelectItem value='vi'>Tiếng Việt</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default LanguageSwitcher
