/**
 * LanguageContext — provides { lang, setLang, t } throughout the app
 */
import React, { createContext, useContext, useState, useCallback } from 'react'
import { getT, SUPPORTED_LANGS } from '@/i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('farmplus_lang') ?? localStorage.getItem('farmpulse_lang') ?? 'en'
  })

  const setLang = useCallback((code) => {
    if (SUPPORTED_LANGS.find((l) => l.code === code)) {
      setLangState(code)
      localStorage.setItem('farmplus_lang', code)
      document.documentElement.lang = code
    }
  }, [])

  const t = useCallback(getT(lang), [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, SUPPORTED_LANGS }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
