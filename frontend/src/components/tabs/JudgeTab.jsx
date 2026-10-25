/**
 * Tab 4 — Judge Test Suite
 */
import React, { useState, useEffect } from 'react'
import { FlaskConical, Play, History, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import {
  GlassCard, GlassButton, Badge, EmptyState, SectionHeader, Spinner,
} from '@/components/ui'
import { judgeApi } from '@/utils/api'
import { clsx } from 'clsx'

const STATUS_ICON = {
  pass:    CheckCircle2,
  fail:    XCircle,
  error:   AlertCircle,
  pending: Clock,
}
const STATUS_COLOR = {
  pass:    'text-mint',
  fail:    'text-coral',
  error:   'text-amber',
  pending: 'text-gray-400',
}

function SummaryBox({ label, value, color = 'text-emerald-deep' }) {
  return (
    <div className="flex flex-col items-center py-3 flex-1">
      <span className={clsx('text-2xl font-black', color)}>{value ?? '—'}</span>
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide text-center mt-0.5">
        {label}
      </span>
    </div>
  )
}

function ResultRow({ r, t }) {
  const [open, setOpen] = useState(false)
  const Icon = STATUS_ICON[r.status] ?? Clock
  const sev = r.status === 'pass' ? 'pass' : r.status === 'fail' ? 'fail' : 'error'

  return (
    <GlassCard className="overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <Icon size={18} className={STATUS_COLOR[r.status]} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-deep truncate">{r.test_name}</p>
          <p className="text-xs text-gray-500">{r.test_category}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge label={t(`judge_${r.status}`)} severity={sev} />
          {r.score != null && (
            <span className="text-xs font-bold text-gray-600">{(r.score * 100).toFixed(0)}%</span>
          )}
          {r.latency_ms != null && (
            <span className="text-[10px] text-gray-400">{r.latency_ms}ms</span>
          )}
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/40 pt-3 animate-slide-down">
          {r.explanation && (
            <div>
              <p className="text-[10px] font-bold text-emerald-deep uppercase tracking-wide mb-1">{t('judge_explanation')}</p>
              <p className="text-sm text-gray-700">{r.explanation}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {r.input_payload && (
              <div>
                <p className="text-[10px] font-bold text-emerald-deep uppercase tracking-wide mb-1">{t('judge_input')}</p>
                <pre className="text-[11px] bg-emerald-deep/5 rounded-lg p-3 overflow-x-auto text-gray-700 whitespace-pre-wrap max-h-56">
                  {JSON.stringify(JSON.parse(r.input_payload), null, 2)}
                </pre>
              </div>
            )}
            {r.expected_output && (
              <div>
                <p className="text-[10px] font-bold text-emerald-deep uppercase tracking-wide mb-1">{t('judge_expected')}</p>
                <pre className="text-[11px] bg-mint/5 rounded-lg p-3 overflow-x-auto text-gray-700 whitespace-pre-wrap max-h-56">
                  {JSON.stringify(JSON.parse(r.expected_output), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  )
}

export default function JudgeTab() {
  const { t } = useLang()
  const [summary,    setSummary]    = useState(null)
  const [history,    setHistory]    = useState([])
  const [running,    setRunning]    = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [customJson, setCustomJson] = useState('')
  const [customErr,  setCustomErr]  = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const loadHistory = async () => {
    try {
      setHistory(await judgeApi.history())
    } catch {
      // silent
    }
  }

  useEffect(() => { loadHistory() }, [])

  const runBuiltIn = async () => {
    setRunning(true)
    setSummary(null)
    try {
      const res = await judgeApi.runBuiltIn()
      setSummary(res)
      await loadHistory()
    } catch {
      // silent
    } finally {
      setRunning(false)
    }
  }

  const runCustom = async () => {
    setCustomErr('')
    let parsed
    try {
      parsed = JSON.parse(customJson)
    } catch {
      setCustomErr(t('judge_custom_invalid'))
      return
    }
    setRunning(true)
    setSummary(null)
    try {
      const body = {
        test_cases:  Array.isArray(parsed) ? parsed : [parsed],
        judge_model: 'heuristic',
      }
      const res = await judgeApi.run(body)
      setSummary(res)
      await loadHistory()
    } catch {
      // silent
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-5">
      <SectionHeader title={t('judge_title')} subtitle={t('judge_subtitle')} />

      {/* Action buttons */}
      <GlassCard className="p-4 flex flex-col sm:flex-row gap-3">
        <GlassButton
          icon={Play} onClick={runBuiltIn} loading={running} className="flex-1" size="lg"
        >
          {running ? t('judge_running') : t('judge_run_builtin')}
        </GlassButton>
        <GlassButton
          icon={FlaskConical} variant="secondary" onClick={() => setShowCustom((v) => !v)}
          className="flex-1" size="lg"
        >
          {t('judge_run_custom')}
        </GlassButton>
      </GlassCard>

      {/* Custom JSON input */}
      {showCustom && (
        <GlassCard className="p-4 space-y-3 animate-slide-down">
          <p className="text-xs font-bold text-emerald-deep uppercase tracking-wide">{t('judge_custom_json')}</p>
          <textarea
            value={customJson}
            onChange={(e) => setCustomJson(e.target.value)}
            placeholder={t('judge_custom_placeholder')}
            rows={8}
            className="w-full rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm px-4 py-3 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-mint resize-none"
          />
          {customErr && <p className="text-xs text-coral font-medium">{customErr}</p>}
          <GlassButton onClick={runCustom} loading={running} icon={Play} className="w-full">
            {t('submit')}
          </GlassButton>
        </GlassCard>
      )}

      {/* Summary */}
      {summary && (
        <div className="space-y-3 animate-slide-up">
          <h3 className="font-bold text-emerald-deep text-base">{t('judge_summary_title')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <GlassCard className="p-3 text-center">
              <span className="text-2xl font-black text-emerald-deep">{summary.total ?? '—'}</span>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{t('judge_total')}</p>
            </GlassCard>
            <GlassCard className="p-3 text-center border-l-4 border-mint">
              <span className="text-2xl font-black text-mint">{summary.passed ?? '—'}</span>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{t('judge_passed')}</p>
            </GlassCard>
            <GlassCard className="p-3 text-center border-l-4 border-coral">
              <span className="text-2xl font-black text-coral">{summary.failed ?? '—'}</span>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{t('judge_failed')}</p>
            </GlassCard>
            <GlassCard className="p-3 text-center border-l-4 border-amber">
              <span className="text-2xl font-black text-amber">{summary.errors ?? '—'}</span>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{t('judge_errors')}</p>
            </GlassCard>
            <GlassCard className="p-3 text-center">
              <span className="text-2xl font-black text-emerald-deep">
                {summary.avg_score != null ? `${(summary.avg_score * 100).toFixed(0)}%` : '—'}
              </span>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{t('judge_avg_score')}</p>
            </GlassCard>
            <GlassCard className="p-3 text-center">
              <span className="text-2xl font-black text-emerald-deep">
                {summary.avg_latency_ms != null ? `${summary.avg_latency_ms}ms` : '—'}
              </span>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{t('judge_avg_latency')}</p>
            </GlassCard>
          </div>

          {/* Result rows */}
          {summary.results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-deep uppercase tracking-wide">{t('judge_results_title')}</p>
              {summary.results.map((r) => (
                <ResultRow key={r.id} r={r} t={t} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History toggle */}
      <div>
        <GlassButton
          icon={History} variant="ghost" size="sm"
          onClick={() => setShowHistory((v) => !v)}
          className="w-full border border-white/40"
        >
          {t('judge_history')} ({history.length})
        </GlassButton>

        {showHistory && (
          <div className="mt-3 space-y-2 animate-slide-down">
            {history.length === 0 ? (
              <EmptyState icon={History} title={t('judge_no_history')} />
            ) : (
              history.map((r) => <ResultRow key={r.id} r={r} t={t} />)
            )}
          </div>
        )}
      </div>
    </div>
  )
}
