/**
 * Tab 1 — Field Profiles
 */
import React, { useState, useEffect } from 'react'
import { Plus, MapPin, Leaf, Droplets, Trash2, Pencil, X, Check, LocateFixed } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import {
  GlassCard, GlassButton, InputField, SelectField,
  Badge, EmptyState, SectionHeader, Spinner,
} from '@/components/ui'
import { fieldsApi } from '@/utils/api'

const CROP_OPTIONS  = ['Rice','Wheat','Cotton','Maize','Sugarcane','Groundnut','Soybean','Sorghum','Other']
const SOIL_OPTIONS  = ['Black Cotton','Red Loam','Alluvial','Sandy','Clay','Loam','Other']
const IRR_OPTIONS   = ['Drip','Flood','Sprinkler','Canal','Borewell','Rainfed']

const EMPTY_FORM = {
  name: '', crop_type: '', area_acres: '', latitude: '', longitude: '',
  soil_type: '', irrigation_method: '', sowing_date: '',
}

export default function FieldsTab() {
  const { t } = useLang()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)   // field id being edited
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [toast, setToast]       = useState(null)

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    try {
      setLoading(true)
      setFields(await fieldsApi.list())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true) }

  const openEdit = (f) => {
    setForm({
      name: f.name, crop_type: f.crop_type,
      area_acres: String(f.area_acres),
      latitude: String(f.latitude ?? ''), longitude: String(f.longitude ?? ''),
      soil_type: f.soil_type ?? '', irrigation_method: f.irrigation_method ?? '',
      sowing_date: f.sowing_date ?? '',
    })
    setEditing(f.id)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        ...form,
        area_acres:  parseFloat(form.area_acres) || 1,
        latitude:    form.latitude  ? parseFloat(form.latitude)  : null,
        longitude:   form.longitude ? parseFloat(form.longitude) : null,
      }
      if (editing) {
        await fieldsApi.update(editing, body)
      } else {
        await fieldsApi.create(body)
      }
      setShowForm(false)
      await load()
      notify(t('field_saved'))
    } catch {
      notify(t('error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fieldsApi.delete(deleteId)
      setDeleteId(null)
      await load()
      notify(t('field_deleted'))
    } catch {
      notify(t('error'), 'error')
    }
  }

  const geoLocate = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setForm((f) => ({
        ...f,
        latitude:  String(pos.coords.latitude.toFixed(5)),
        longitude: String(pos.coords.longitude.toFixed(5)),
      }))
    })
  }

  return (
    <div className="relative animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[90] px-5 py-3 rounded-2xl shadow-glass-lg text-white text-sm font-semibold animate-slide-down
          ${toast.type === 'error' ? 'bg-coral' : 'bg-emerald-mid'}`}>
          {toast.msg}
        </div>
      )}

      <SectionHeader
        title={t('fields_title')}
        subtitle={fields.length > 0 ? t('fields_count').replace('{count}', fields.length) : t('fields_subtitle')}
        action={
          <GlassButton icon={Plus} onClick={openAdd} size="sm">
            {t('field_add')}
          </GlassButton>
        }
      />

      {/* Field Stats Summary if fields exist */}
      {fields.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <GlassCard className="p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">{t('nav_fields')}</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-deep mt-0.5">{fields.length}</p>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">Total Area</p>
            <p className="text-xl sm:text-2xl font-black text-mint mt-0.5">
              {fields.reduce((acc, curr) => acc + (parseFloat(curr.area_acres) || 0), 0).toFixed(1)} <span className="text-xs font-normal text-gray-500">ac</span>
            </p>
          </GlassCard>
          <GlassCard className="p-3 text-center col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500 font-medium">Crops</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-mid mt-0.5">
              {new Set(fields.map(f => f.crop_type)).size}
            </p>
          </GlassCard>
        </div>
      )}

      {/* Field list — responsive 1, 2, or 3 columns */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={40} /></div>
      ) : fields.length === 0 ? (
        <EmptyState icon={Leaf} title={t('fields_empty')} hint={t('fields_empty_hint')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f) => (
            <GlassCard key={f.id} className="p-4 flex flex-col justify-between hover:shadow-glass-lg transition-all duration-200">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-emerald-deep truncate text-base">{f.name}</h3>
                    <div className="mt-1">
                      <Badge label={f.crop_type} severity="none" />
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <GlassButton icon={Pencil} size="icon" variant="ghost" onClick={() => openEdit(f)} title="Edit" />
                    <GlassButton icon={Trash2} size="icon" variant="ghost" onClick={() => setDeleteId(f.id)}
                      className="text-coral hover:bg-coral/10" title="Delete" />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600 bg-white/40 rounded-xl p-2.5 border border-white/50">
                  {f.area_acres && (
                    <span className="flex items-center gap-1 font-medium">
                      <Leaf size={12} className="text-mint shrink-0"/> {f.area_acres} acres
                    </span>
                  )}
                  {f.soil_type && (
                    <span className="flex items-center gap-1">
                      <Droplets size={12} className="text-emerald-mid shrink-0"/> {f.soil_type}
                    </span>
                  )}
                  {f.irrigation_method && (
                    <span className="truncate">💧 {f.irrigation_method}</span>
                  )}
                  {f.sowing_date && (
                    <span className="truncate">📅 Sown: {f.sowing_date}</span>
                  )}
                  {f.latitude && (
                    <span className="flex items-center gap-1 col-span-2 text-[11px] text-gray-400 truncate">
                      <MapPin size={11} className="shrink-0"/> {f.latitude}, {f.longitude}
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-emerald-deep/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-xl md:max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 animate-slide-up shadow-glass-lg">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/40">
              <h3 className="font-bold text-emerald-deep text-lg">
                {editing ? t('field_edit') : t('field_add')}
              </h3>
              <GlassButton icon={X} size="icon" variant="ghost" onClick={() => setShowForm(false)} />
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <InputField label={t('field_name')} id="name" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t('field_name_placeholder')} required />

                <InputField label={t('field_crop_type')} id="crop_type" value={form.crop_type}
                  onChange={(e) => setForm((f) => ({ ...f, crop_type: e.target.value }))}
                  placeholder={t('field_crop_type_placeholder')} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <InputField label={t('field_area')} id="area_acres" type="number" value={form.area_acres}
                  onChange={(e) => setForm((f) => ({ ...f, area_acres: e.target.value }))}
                  placeholder={t('field_area_placeholder')} min="0.01" step="0.01" />

                <SelectField label={t('field_soil_type')} id="soil_type" value={form.soil_type}
                  onChange={(e) => setForm((f) => ({ ...f, soil_type: e.target.value }))}
                  options={SOIL_OPTIONS.map((s) => ({ value: s, label: s }))} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <SelectField label={t('field_irrigation')} id="irrigation_method" value={form.irrigation_method}
                  onChange={(e) => setForm((f) => ({ ...f, irrigation_method: e.target.value }))}
                  options={IRR_OPTIONS.map((s) => ({ value: s, label: s }))} />

                <InputField label={t('field_sowing_date')} id="sowing_date" type="date" value={form.sowing_date}
                  onChange={(e) => setForm((f) => ({ ...f, sowing_date: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <InputField label={t('field_latitude')} id="latitude" type="number" value={form.latitude}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                  placeholder="e.g. 16.5062" step="0.00001" />
                <InputField label={t('field_longitude')} id="longitude" type="number" value={form.longitude}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                  placeholder="e.g. 80.6480" step="0.00001" />
              </div>

              <GlassButton type="button" icon={LocateFixed} variant="ghost" size="sm" onClick={geoLocate}
                className="w-full border border-mint/30 py-2">
                {t('field_location_hint')}
              </GlassButton>

              <div className="flex gap-3 pt-2">
                <GlassButton type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  {t('cancel')}
                </GlassButton>
                <GlassButton type="submit" loading={saving} icon={Check} className="flex-1">
                  {t('save')}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-emerald-deep/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-sm p-6 animate-slide-up text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto">
              <Trash2 size={28} className="text-coral" />
            </div>
            <p className="text-gray-700 font-medium">{t('field_delete_confirm')}</p>
            <div className="flex gap-3">
              <GlassButton variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>
                {t('cancel')}
              </GlassButton>
              <GlassButton variant="danger" className="flex-1" onClick={handleDelete}>
                {t('delete')}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
