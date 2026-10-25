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

const PRESETS = [
  {
    name: '🔥 Heatwave & Drought',
    crop_type: 'Rice',
    growth_stage: 'Flowering',
    temperature_c: '43.5',
    humidity_pct: '35',
    soil_moisture_pct: '18',
    rainfall_mm_last7d: '0',
    leaf_color: 'Yellowing leaf tips',
    visible_symptoms: 'Curling leaves, premature dry leaves',
  },
  {
    name: '💧 High Humidity & Rot Risk',
    crop_type: 'Cotton',
    growth_stage: 'Vegetative',
    temperature_c: '33',
    humidity_pct: '94',
    soil_moisture_pct: '85',
    rainfall_mm_last7d: '70',
    leaf_color: 'Brown water-soaked spots',
    visible_symptoms: 'Fungal leaf lesions',
  },
  {
    name: '🌱 Optimal Field',
    crop_type: 'Wheat',
    growth_stage: 'Tillering',
    temperature_c: '23',
    humidity_pct: '65',
    soil_moisture_pct: '55',
    rainfall_mm_last7d: '15',
    leaf_color: 'Lush green',
    visible_symptoms: 'None, healthy stand',
  },
]

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

  const applyPreset = (p) => {
    setForm((prev) => ({
      ...prev,
      crop_type: p.crop_type,
      growth_stage: p.growth_stage,
      temperature_c: p.temperature_c,
      humidity_pct: p.humidity_pct,
      soil_moisture_pct: p.soil_moisture_pct,
      rainfall_mm_last7d: p.rainfall_mm_last7d,
      leaf_color: p.leaf_color,
      visible_symptoms: p.visible_symptoms,
    }))
  }

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
    <div className="animate-fade-in space-y-4">
      <SectionHeader title={t('stress_title')} subtitle={t('stress_subtitle')} />

      {/* Responsive layout: 1 column on mobile, 2 columns on desktop/tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form & Quick Presets */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-emerald-deep uppercase tracking-wider">Quick Presets</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2 py-1.5 rounded-xl bg-white/70 hover:bg-mint/20 border border-white/60 hover:border-mint text-[11px] font-semibold text-emerald-deep transition-all text-center truncate shadow-sm active:scale-95"
                  title={p.name}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <GlassCard className="p-4 sm:p-5">
            <form onSubmit={handleAnalyze} className="space-y-3.5">
              {/* Field selector */}
              {fields.length > 0 && (
                <SelectField
                  label={t('stress_select_field')} id="field_id" value={form.field_id}
                  onChange={fld('field_id')}
                  options={fields.map((f) => ({ value: f.id, label: `${f.name} (${f.crop_type})` }))}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <button type="button" className="text-xs font-semibold text-mint flex items-center gap-1 hover:underline"
                onClick={() => setShowNutrient((v) => !v)}>
                {showNutrient ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                {t('stress_nutrient_optional')}
              </button>

              {showNutrient && (
                <div className="grid grid-cols-3 gap-2.5 animate-slide-down bg-mint/5 p-3 rounded-xl border border-mint/20">
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

              <GlassButton type="submit" loading={loading} icon={Activity} className="w-full mt-2" size="lg">
                {loading ? t('stress_analyzing') : t('stress_analyze')}
              </GlassButton>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Real-Time Results & Explainability */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-emerald-deep text-lg">{t('stress_result_title')}</h3>
                <span className="text-xs text-gray-500 font-mono">Live Advisory</span>
              </div>

              {/* Overall summary card */}
              <GlassCard className={clsx('p-5 bg-gradient-to-br text-white shadow-glass-lg', overallColor)}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">{t('stress_overall')}</p>
                    <p className="text-2xl sm:text-3xl font-black capitalize mt-0.5">
                      {t(`stress_level_${result.overall_stress_level}`)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-xs">{t('stress_confidence')}</p>
                    <p className="text-xl sm:text-2xl font-bold">{Math.round(result.model_confidence * 100)}%</p>
                  </div>
                </div>
                <StressMeter score={result.stress_score} level={result.overall_stress_level} />
              </GlassCard>

              {/* Stressors */}
              {result.primary_stressors.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-emerald-deep uppercase tracking-wide">{t('stress_stressors')}</p>
                  {result.primary_stressors.map((s, i) => (
                    <StressorCard key={i} stressor={s} />
                  ))}
                </div>
              ) : (
                <GlassCard className="p-6 text-center">
                  <CheckCircle size={36} className="text-mint mx-auto mb-2" />
                  <p className="text-emerald-deep font-bold text-base">{t('stress_no_stress')}</p>
                </GlassCard>
              )}

              {/* Actions */}
              {result.action_items.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-emerald-deep uppercase tracking-wide">{t('stress_actions')}</p>
                  {result.action_items.map((a, i) => <ActionCard key={i} action={a} t={t} />)}
                </div>
              )}

              {/* Explainability */}
              <GlassCard className="p-4 sm:p-5 border-l-4 border-amber">
                <div className="flex items-start gap-3">
                  <Lightbulb size={20} className="text-amber shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-deep uppercase tracking-wide mb-1">
                      {t('stress_explain')}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{result.explainability_notes}</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[380px] border-dashed border-2 border-mint/30">
              <div className="w-16 h-16 rounded-3xl bg-mint/10 flex items-center justify-center mb-4">
                <Activity size={32} className="text-mint animate-pulse-soft" />
              </div>
              <h4 className="text-base font-bold text-emerald-deep mb-1">Advisory Pipeline Standby</h4>
              <p className="text-sm text-gray-500 max-w-sm">
                Enter your field's environmental observations or tap any <strong>Quick Preset</strong> on the left, then click <strong>{t('stress_analyze')}</strong> to generate explainable stress diagnostics.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
