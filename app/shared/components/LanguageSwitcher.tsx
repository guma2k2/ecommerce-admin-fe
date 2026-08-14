import { Check, ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/core/components/shadcn/dropdown-menu'
import { Button } from '~/core/components/shadcn/button'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const currentLanguage = i18n.language ? i18n.language.slice(0, 2) : 'en'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='flex items-center gap-1.5 h-9 px-3 text-xs font-medium border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer'
        >
          <Globe className='h-3.5 w-3.5 text-muted-foreground' />
          <span>{currentLanguage === 'vi' ? 'Tiếng Việt' : 'English'}</span>
          <ChevronDown className='h-3.5 w-3.5 text-muted-foreground opacity-70 ml-0.5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={4} className='w-36 p-1 shadow-md border border-gray-200 dark:border-zinc-800'>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className='flex items-center justify-between cursor-pointer text-xs py-1.5 px-2.5 rounded-sm'
        >
          <span className={currentLanguage === 'en' ? 'font-semibold text-primary' : 'font-normal'}>English</span>
          {currentLanguage === 'en' && <Check className='h-3.5 w-3.5 text-primary' />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('vi')}
          className='flex items-center justify-between cursor-pointer text-xs py-1.5 px-2.5 rounded-sm'
        >
          <span className={currentLanguage === 'vi' ? 'font-semibold text-primary' : 'font-normal'}>Tiếng Việt</span>
          {currentLanguage === 'vi' && <Check className='h-3.5 w-3.5 text-primary' />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher
