/**
 * BottomNavBar — floating 4-tab navigation bar
 */
import React from 'react'
import { Sprout, Activity, Bell, FlaskConical } from 'lucide-react'
import { useTab } from '@/contexts/TabContext'
import { useLang } from '@/contexts/LanguageContext'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { tab: 'fields',      icon: Sprout,       labelKey: 'nav_fields' },
  { tab: 'crop_stress', icon: Activity,      labelKey: 'nav_crop_stress' },
  { tab: 'alerts',      icon: Bell,          labelKey: 'nav_alerts' },
  { tab: 'judge',       icon: FlaskConical,  labelKey: 'nav_judge' },
]

export default function BottomNavBar({ unreadCount = 0 }) {
  const { activeTab, setActiveTab } = useTab()
  const { t } = useLang()

  return (
    <nav className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md md:hidden">
      <div className="flex items-center justify-around bg-emerald-deep/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-glass-lg px-2 py-1.5 sm:py-2">
        {NAV_ITEMS.map(({ tab, icon: Icon, labelKey }) => {
          const active = activeTab === tab
          const isAlerts = tab === 'alerts'
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'relative flex flex-col items-center gap-1 flex-1 py-1 px-1 rounded-xl min-h-[44px]',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-mint',
                active
                  ? 'bg-mint/20 text-mint scale-105'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5 active:scale-95'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {isAlerts && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse-soft">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={clsx(
                'text-[10px] font-semibold leading-tight text-center truncate w-full',
                active ? 'text-mint' : 'text-white/60'
              )}>
                {t(labelKey).split(' ')[0]}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
