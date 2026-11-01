import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { en, vi } from '~/shared/locales'

const resources = {
  en: {
    translation: en
  },
  vi: {
    translation: vi
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
