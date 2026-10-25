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

      {/* Alert Stats Banner */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <GlassCard className="p-3 text-center border-l-4 border-coral">
            <span className="text-xs text-gray-500 font-medium">Critical</span>
            <p className="text-xl font-black text-coral mt-0.5">
              {alerts.filter(a => a.severity === 'critical' && !a.is_read).length}
            </p>
          </GlassCard>
          <GlassCard className="p-3 text-center border-l-4 border-amber">
            <span className="text-xs text-gray-500 font-medium">High</span>
            <p className="text-xl font-black text-amber mt-0.5">
              {alerts.filter(a => a.severity === 'high' && !a.is_read).length}
            </p>
          </GlassCard>
          <GlassCard className="p-3 text-center border-l-4 border-mint">
            <span className="text-xs text-gray-500 font-medium">Medium/Low</span>
            <p className="text-xl font-black text-mint mt-0.5">
              {alerts.filter(a => (a.severity === 'medium' || a.severity === 'low') && !a.is_read).length}
            </p>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <span className="text-xs text-gray-500 font-medium">Total Alerts</span>
            <p className="text-xl font-black text-emerald-deep mt-0.5">{alerts.length}</p>
          </GlassCard>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none sm:flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border',
              filter === f
                ? 'bg-emerald-deep text-white border-emerald-deep shadow-sm'
                : 'bg-white/70 text-gray-600 border-white/60 hover:border-mint/60 hover:text-emerald-deep active:scale-95'
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const CatIcon = CATEGORY_ICONS[a.category] ?? Bell
            return (
              <GlassCard
                key={a.id}
                className={clsx(
                  'p-4 border-l-4 transition-all duration-300 flex flex-col justify-between hover:shadow-glass-lg',
                  SEV_BORDER[a.severity] ?? 'border-l-mint',
                  a.is_read && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                    a.severity === 'critical' ? 'bg-coral/10 text-coral' :
                    a.severity === 'high'     ? 'bg-coral/10 text-coral' :
                    a.severity === 'medium'   ? 'bg-amber/10 text-amber' : 'bg-mint/10 text-mint'
                  )}>
                    <CatIcon size={18} />
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
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{a.message}</p>
                    {a.recommendation && (
                      <div className="mt-2.5 bg-mint/10 rounded-xl px-3 py-2 border border-mint/20">
                        <p className="text-xs font-semibold text-emerald-deep mb-0.5">{t('alert_recommendation')}</p>
                        <p className="text-xs text-gray-700 leading-normal">{a.recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {!a.is_read && (
                  <div className="mt-3 pt-2 border-t border-white/40 flex justify-end">
                    <button
                      onClick={() => markRead(a.id)}
                      className="text-xs text-mint hover:text-emerald-deep font-semibold transition-colors flex items-center gap-1 active:scale-95"
                    >
                      <CheckCheck size={14} /> {t('alerts_mark_read')}
                    </button>
                  </div>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
