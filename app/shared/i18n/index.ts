import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enTranslation from '~/shared/locales/en.json'
import viTranslation from '~/shared/locales/vi.json'

const resources = {
  en: {
    translation: enTranslation
  },
  vi: {
    translation: viTranslation
  }
}

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      supportedLngs: ['en', 'vi'],
      debug: import.meta.env.DEV,
      interpolation: {
        escapeValue: false
      },
      keySeparator: '.',
      nsSeparator: false,
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage', 'cookie']
      }
    })
}

export default i18n
