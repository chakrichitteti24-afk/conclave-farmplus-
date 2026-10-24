/**
 * Tab 2 — Check Crop Stress
 */
import React, { useState, useEffect } from 'react'
import { Activity, ChevronDown, ChevronUp, Lightbulb, AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import {
  GlassCard, GlassButton, InputField, SelectField,
  Badge, StressMeter, SectionHeader, Spinner,
} from '@/components/ui'
import { cropStressApi, fieldsApi } from '@/utils/api'
import { clsx } from 'clsx'

const GROWTH_STAGES = [
  'Germination','Seedling','Vegetative','Tillering',
  'Panicle Initiation','Flowering','Grain Filling','Maturity','Harvest',
]

const SEV_ICON = { low: CheckCircle, medium: AlertTriangle, high: AlertTriangle, critical: Zap }
const SEV_COLOR = {
  low:      'text-mint',
  medium:   'text-amber',
  high:     'text-coral',
  critical: 'text-coral-dark',
}

function StressorCard({ stressor }) {
  const [open, setOpen] = useState(false)
  const Icon = SEV_ICON[stressor.severity] ?? AlertTriangle
  return (
    <GlassCard className="p-4">
      <button className="w-full flex items-center justify-between gap-3" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3 min-w-0">
          <Icon size={20} className={SEV_COLOR[stressor.severity]} />
          <div className="text-left min-w-0">
            <p className="font-semibold text-emerald-deep truncate">{stressor.factor}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge label={stressor.severity} severity={stressor.severity} />
              <span className="text-xs text-gray-500">
                {Math.round(stressor.confidence * 100)}% conf.
              </span>
            </div>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
               : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="mt-3 pt-3 border-t border-white/40 space-y-2 animate-slide-down">
          <p className="text-sm text-gray-700 leading-relaxed">{stressor.explanation}</p>
          <div className="flex flex-wrap gap-1.5">
            {stressor.contributing_features.map((f) => (
              <span key={f} className="px-2 py-0.5 bg-mint/10 text-emerald-deep text-xs rounded-full border border-mint/30 font-mono">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  )
}

function ActionCard({ action, t }) {
  return (
    <GlassCard className="p-4 border-l-4 border-mint">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-emerald-deep text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
          {action.priority}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-emerald-deep text-sm leading-snug">{action.action}</p>
          <p className="text-xs text-gray-600 mt-1">{action.reason}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <span className="text-xs text-gray-500">
              <span className="font-medium">{t('stress_timeline')}:</span> {action.timeline}
            </span>
            {action.estimated_yield_impact && (
              <span className="text-xs text-mint font-medium">
                {t('stress_yield_impact')}: {action.estimated_yield_impact}
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default function CropStressTab() {
  const { t } = useLang()
  const [fields, setFields]       = useState([])
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [showNutrient, setShowNutrient] = useState(false)

  const [form, setForm] = useState({
    field_id: '', crop_type: 'Rice', growth_stage: 'Vegetative',
    temperature_c: '', humidity_pct: '', soil_moisture_pct: '',
    rainfall_mm_last7d: '0',
    leaf_color: '', visible_symptoms: '',
    n_ppm: '', p_ppm: '', k_ppm: '',
  })

  useEffect(() => {
    fieldsApi.list().then(setFields).catch(() => {})
  }, [])

  const fld = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const body = {
        field_id:             form.field_id || null,
        crop_type:            form.crop_type,
        growth_stage:         form.growth_stage,
        temperature_c:        parseFloat(form.temperature_c),
        humidity_pct:         parseFloat(form.humidity_pct),
        soil_moisture_pct:    parseFloat(form.soil_moisture_pct),
        rainfall_mm_last7d:   parseFloat(form.rainfall_mm_last7d) || 0,
        leaf_color:           form.leaf_color || null,
        visible_symptoms:     form.visible_symptoms || null,
        n_ppm:                form.n_ppm ? parseFloat(form.n_ppm) : null,
        p_ppm:                form.p_ppm ? parseFloat(form.p_ppm) : null,
        k_ppm:                form.k_ppm ? parseFloat(form.k_ppm) : null,
      }
      const res = await cropStressApi.analyze(body)
      setResult(res)
    } catch (err) {
      setError(err.message ?? t('stress_error'))
    } finally {
      setLoading(false)
    }
  }

  const overallColor = {
    none:     'from-mint to-mint-light',
    low:      'from-mint to-emerald-mid',
    medium:   'from-amber-light to-amber',
    high:     'from-amber to-coral',
    critical: 'from-coral to-coral-dark',
  }[result?.overall_stress_level] ?? 'from-mint to-mint-light'

  return (
    <div className="animate-fade-in space-y-5">
      <SectionHeader title={t('stress_title')} subtitle={t('stress_subtitle')} />

      {/* Input Form */}
      <GlassCard className="p-5">
        <form onSubmit={handleAnalyze} className="space-y-4">
          {/* Field selector */}
          {fields.length > 0 && (
            <SelectField
              label={t('stress_select_field')} id="field_id" value={form.field_id}
              onChange={fld('field_id')}
              options={fields.map((f) => ({ value: f.id, label: `${f.name} — ${f.crop_type}` }))}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <InputField label={t('stress_crop_type')} id="crop_type" value={form.crop_type}
              onChange={fld('crop_type')} placeholder="Rice" required />
            <SelectField label={t('stress_growth_stage')} id="growth_stage" value={form.growth_stage}
              onChange={fld('growth_stage')}
              options={GROWTH_STAGES.map((s) => ({ value: s, label: s }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField label={t('stress_temp')} id="temp" type="number" value={form.temperature_c}
              onChange={fld('temperature_c')} placeholder="32" required min="-10" max="60" step="0.1" />
            <InputField label={t('stress_humidity')} id="hum" type="number" value={form.humidity_pct}
              onChange={fld('humidity_pct')} placeholder="65" required min="0" max="100" step="1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField label={t('stress_soil_moisture')} id="sm" type="number" value={form.soil_moisture_pct}
              onChange={fld('soil_moisture_pct')} placeholder="55" required min="0" max="100" step="1" />
            <InputField label={t('stress_rainfall')} id="rain" type="number" value={form.rainfall_mm_last7d}
              onChange={fld('rainfall_mm_last7d')} placeholder="0" min="0" step="0.5" />
          </div>

          <InputField label={t('stress_leaf_color')} id="lc" value={form.leaf_color}
            onChange={fld('leaf_color')} placeholder={t('stress_leaf_color_placeholder')} />

          <InputField label={t('stress_visible_symptoms')} id="vs" value={form.visible_symptoms}
            onChange={fld('visible_symptoms')} placeholder={t('stress_visible_symptoms_placeholder')} />

          {/* Nutrient toggle */}
          <button type="button" className="text-xs font-semibold text-mint flex items-center gap-1"
            onClick={() => setShowNutrient((v) => !v)}>
            {showNutrient ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            {t('stress_nutrient_optional')}
          </button>

          {showNutrient && (
            <div className="grid grid-cols-3 gap-3 animate-slide-down">
              <InputField label={t('stress_n')} id="n" type="number" value={form.n_ppm}
                onChange={fld('n_ppm')} placeholder="20" min="0" step="0.1" />
              <InputField label={t('stress_p')} id="p" type="number" value={form.p_ppm}
                onChange={fld('p_ppm')} placeholder="10" min="0" step="0.1" />
              <InputField label={t('stress_k')} id="k" type="number" value={form.k_ppm}
                onChange={fld('k_ppm')} placeholder="30" min="0" step="0.1" />
            </div>
          )}

          {error && (
            <div className="bg-coral/10 border border-coral/30 rounded-xl px-4 py-3 text-sm text-coral font-medium">
              {error}
            </div>
          )}

          <GlassButton type="submit" loading={loading} icon={Activity} className="w-full" size="lg">
            {loading ? t('stress_analyzing') : t('stress_analyze')}
          </GlassButton>
        </form>
      </GlassCard>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          <h3 className="font-bold text-emerald-deep text-base">{t('stress_result_title')}</h3>

          {/* Overall summary card */}
          <GlassCard className={clsx('p-5 bg-gradient-to-br text-white', overallColor)}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">{t('stress_overall')}</p>
                <p className="text-2xl font-black capitalize mt-0.5">
                  {t(`stress_level_${result.overall_stress_level}`)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-xs">{t('stress_confidence')}</p>
                <p className="text-xl font-bold">{Math.round(result.model_confidence * 100)}%</p>
              </div>
            </div>
            <StressMeter score={result.stress_score} level={result.overall_stress_level} />
          </GlassCard>

          {/* Stressors */}
          {result.primary_stressors.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-deep uppercase tracking-wide">{t('stress_stressors')}</p>
              {result.primary_stressors.map((s, i) => (
                <StressorCard key={i} stressor={s} />
              ))}
            </div>
          ) : (
            <GlassCard className="p-4 text-center">
              <CheckCircle size={32} className="text-mint mx-auto mb-2" />
              <p className="text-emerald-deep font-semibold">{t('stress_no_stress')}</p>
            </GlassCard>
          )}

          {/* Actions */}
          {result.action_items.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-deep uppercase tracking-wide">{t('stress_actions')}</p>
              {result.action_items.map((a, i) => <ActionCard key={i} action={a} t={t} />)}
            </div>
          )}

          {/* Explainability */}
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb size={18} className="text-amber shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-deep uppercase tracking-wide mb-1">
                  {t('stress_explain')}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{result.explainability_notes}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
