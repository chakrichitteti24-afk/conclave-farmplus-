/**
 * TopLanguageBar — fixed top bar with app branding + language switcher
 */
import React from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'
import { clsx } from 'clsx'

export default function TopLanguageBar() {
  const { lang, setLang, t, SUPPORTED_LANGS } = useLang()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-emerald-deep/95 backdrop-blur-md border-b border-white/10 shadow-glass">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-mint to-emerald-bright flex items-center justify-center shadow-glass-sm">
          <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
            <path d="M16 4C16 4 7 11 7 19a9 9 0 0 0 18 0C25 11 16 4 16 4z" fill="white" fillOpacity="0.9"/>
            <path d="M16 12v10M11 18c2.5-2.5 5-2.5 5-2.5s2.5 0 5 2.5" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="leading-none">
          <p className="text-white font-bold text-sm tracking-tight">{t('app_name')}</p>
          <p className="text-mint/80 text-[10px] font-medium">{t('app_tagline')}</p>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="flex items-center gap-1.5">
        <Globe size={14} className="text-mint/70" />
        <div className="flex rounded-lg overflow-hidden border border-white/20">
          {SUPPORTED_LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={clsx(
                'px-2.5 py-1 text-xs font-semibold transition-all duration-200',
                lang === l.code
                  ? 'bg-mint text-emerald-deep'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {l.nativeLabel}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
