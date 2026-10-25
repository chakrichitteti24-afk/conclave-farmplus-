/**
 * TopLanguageBar — fixed top bar with app branding + language switcher + responsive desktop/tablet nav
 */
import React from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { useTab } from '@/contexts/TabContext'
import { Globe, Sprout, Activity, Bell, FlaskConical } from 'lucide-react'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { tab: 'fields',      icon: Sprout,       labelKey: 'nav_fields' },
  { tab: 'crop_stress', icon: Activity,     labelKey: 'nav_crop_stress' },
  { tab: 'alerts',      icon: Bell,         labelKey: 'nav_alerts' },
  { tab: 'judge',       icon: FlaskConical, labelKey: 'nav_judge' },
]

export default function TopLanguageBar({ unreadCount = 0 }) {
  const { lang, setLang, t, SUPPORTED_LANGS } = useLang()
  const { activeTab, setActiveTab } = useTab()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-emerald-deep/95 backdrop-blur-md border-b border-white/10 shadow-glass">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => setActiveTab('fields')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-mint to-emerald-bright flex items-center justify-center shadow-glass-sm shrink-0">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <path d="M16 4C16 4 7 11 7 19a9 9 0 0 0 18 0C25 11 16 4 16 4z" fill="white" fillOpacity="0.9"/>
              <path d="M16 12v10M11 18c2.5-2.5 5-2.5 5-2.5s2.5 0 5 2.5" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="leading-none">
            <p className="text-white font-bold text-sm tracking-tight">{t('app_name')}</p>
            <p className="text-mint/80 text-[10px] font-medium hidden sm:block">{t('app_tagline')}</p>
          </div>
        </div>

        {/* Tablet & Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_ITEMS.map(({ tab, icon: Icon, labelKey }) => {
            const active = activeTab === tab
            const isAlerts = tab === 'alerts'
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200',
                  active
                    ? 'bg-mint text-emerald-deep shadow-glass-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <div className="relative">
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  {isAlerts && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 bg-coral text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span>{t(labelKey)}</span>
              </button>
            )
          })}
        </nav>

        {/* Language Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Globe size={14} className="text-mint/70 shrink-0" />
          <div className="flex rounded-lg overflow-hidden border border-white/20 bg-black/10">
            {SUPPORTED_LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={clsx(
                  'px-2.5 py-1 text-xs font-semibold transition-all duration-200',
                  lang === l.code
                    ? 'bg-mint text-emerald-deep font-bold shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                {l.nativeLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
