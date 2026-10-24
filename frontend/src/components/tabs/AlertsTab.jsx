/**
 * Tab 3 — Proactive Alerts
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Bell, RefreshCw, CheckCheck, Cloud, Bug, Leaf, TrendingUp } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import {
  GlassCard, GlassButton, Badge, EmptyState, SectionHeader, Spinner,
} from '@/components/ui'
import { alertsApi } from '@/utils/api'
import { clsx } from 'clsx'

const CATEGORY_ICONS = {
  Weather:   Cloud,
  Pest:      Bug,
  Nutrition: Leaf,
  Market:    TrendingUp,
}

const SEV_BORDER = {
  low:      'border-l-mint',
  medium:   'border-l-amber',
  high:     'border-l-coral',
  critical: 'border-l-coral-dark',
}

const FILTERS = ['All','Weather','Pest','Nutrition','Market']

export default function AlertsTab({ onUnreadChange }) {
  const { t } = useLang()
  const [alerts, setAlerts]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('All')
  const [marking, setMarking]     = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await alertsApi.list()
      setAlerts(data)
      onUnreadChange?.(data.filter((a) => !a.is_read).length)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [onUnreadChange])

  useEffect(() => { load() }, [load])

  const markRead = async (id) => {
    await alertsApi.markRead([id])
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    )
    onUnreadChange?.(alerts.filter((a) => !a.is_read && a.id !== id).length)
  }

  const markAllRead = async () => {
    setMarking(true)
    const unread = alerts.filter((a) => !a.is_read).map((a) => a.id)
    if (unread.length > 0) {
      await alertsApi.markRead(unread)
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })))
      onUnreadChange?.(0)
    }
    setMarking(false)
  }

  const filtered = filter === 'All'
    ? alerts
    : alerts.filter((a) => a.category === filter)

  const unread = alerts.filter((a) => !a.is_read).length

  return (
    <div className="animate-fade-in space-y-4">
      <SectionHeader
        title={t('alerts_title')}
        subtitle={unread > 0 ? t('alerts_unread_count').replace('{count}', unread) : t('alerts_subtitle')}
        action={
          <div className="flex gap-2">
            <GlassButton icon={RefreshCw} size="icon" variant="ghost" onClick={load} />
            {unread > 0 && (
              <GlassButton icon={CheckCheck} size="sm" variant="secondary" loading={marking} onClick={markAllRead}>
                {t('alerts_mark_all_read')}
              </GlassButton>
            )}
          </div>
        }
      />

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border',
              filter === f
                ? 'bg-emerald-deep text-white border-emerald-deep'
                : 'bg-white/60 text-gray-600 border-white/60 hover:border-mint/60 hover:text-emerald-deep'
            )}
          >
            {t(`alerts_filter_${f.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={40} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bell} title={t('alerts_empty')} />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const CatIcon = CATEGORY_ICONS[a.category] ?? Bell
            return (
              <GlassCard
                key={a.id}
                className={clsx(
                  'p-4 border-l-4 transition-opacity duration-300',
                  SEV_BORDER[a.severity] ?? 'border-l-mint',
                  a.is_read && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    a.severity === 'critical' ? 'bg-coral/10' :
                    a.severity === 'high'     ? 'bg-coral/10' :
                    a.severity === 'medium'   ? 'bg-amber/10' : 'bg-mint/10'
                  )}>
                    <CatIcon size={18} className={clsx(
                      a.severity === 'critical' || a.severity === 'high' ? 'text-coral' :
                      a.severity === 'medium' ? 'text-amber' : 'text-mint'
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-emerald-deep text-sm leading-snug">{a.title}</p>
                        {!a.is_read && (
                          <span className="w-2 h-2 rounded-full bg-coral animate-pulse-soft shrink-0" />
                        )}
                      </div>
                      <Badge label={t(`alert_sev_${a.severity}`)} severity={a.severity} />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{a.message}</p>
                    {a.recommendation && (
                      <div className="mt-2 bg-mint/10 rounded-lg px-3 py-2 border border-mint/20">
                        <p className="text-xs font-semibold text-emerald-deep mb-0.5">{t('alert_recommendation')}</p>
                        <p className="text-xs text-gray-700">{a.recommendation}</p>
                      </div>
                    )}
                    {!a.is_read && (
                      <button
                        onClick={() => markRead(a.id)}
                        className="mt-2 text-xs text-mint font-semibold hover:underline"
                      >
                        {t('alerts_mark_read')}
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
