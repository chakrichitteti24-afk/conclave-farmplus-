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

      {/* Field list */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={40} /></div>
      ) : fields.length === 0 ? (
        <EmptyState icon={Leaf} title={t('fields_empty')} hint={t('fields_empty_hint')} />
      ) : (
        <div className="space-y-3">
          {fields.map((f) => (
            <GlassCard key={f.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-emerald-deep truncate">{f.name}</h3>
                    <Badge label={f.crop_type} severity="none" />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                    {f.area_acres && (
                      <span className="flex items-center gap-1">
                        <Leaf size={11}/> {f.area_acres} acres
                      </span>
                    )}
                    {f.soil_type && (
                      <span className="flex items-center gap-1">
                        <Droplets size={11}/> {f.soil_type}
                      </span>
                    )}
                    {f.irrigation_method && <span>{f.irrigation_method}</span>}
                    {f.latitude && (
                      <span className="flex items-center gap-1 col-span-2">
                        <MapPin size={11}/> {f.latitude}, {f.longitude}
                      </span>
                    )}
                    {f.sowing_date && <span className="col-span-2">Sown: {f.sowing_date}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <GlassButton icon={Pencil} size="icon" variant="ghost" onClick={() => openEdit(f)} />
                  <GlassButton icon={Trash2} size="icon" variant="ghost" onClick={() => setDeleteId(f.id)}
                    className="text-coral hover:bg-coral/10" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-emerald-deep/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-md max-h-[90vh] overflow-y-auto p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-emerald-deep text-base">
                {editing ? t('field_edit') : t('field_add')}
              </h3>
              <GlassButton icon={X} size="icon" variant="ghost" onClick={() => setShowForm(false)} />
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <InputField label={t('field_name')} id="name" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t('field_name_placeholder')} required />

              <InputField label={t('field_crop_type')} id="crop_type" value={form.crop_type}
                onChange={(e) => setForm((f) => ({ ...f, crop_type: e.target.value }))}
                placeholder={t('field_crop_type_placeholder')} required />

              <InputField label={t('field_area')} id="area_acres" type="number" value={form.area_acres}
                onChange={(e) => setForm((f) => ({ ...f, area_acres: e.target.value }))}
                placeholder={t('field_area_placeholder')} min="0.01" step="0.01" />

              <SelectField label={t('field_soil_type')} id="soil_type" value={form.soil_type}
                onChange={(e) => setForm((f) => ({ ...f, soil_type: e.target.value }))}
                options={SOIL_OPTIONS.map((s) => ({ value: s, label: s }))} />

              <SelectField label={t('field_irrigation')} id="irrigation_method" value={form.irrigation_method}
                onChange={(e) => setForm((f) => ({ ...f, irrigation_method: e.target.value }))}
                options={IRR_OPTIONS.map((s) => ({ value: s, label: s }))} />

              <InputField label={t('field_sowing_date')} id="sowing_date" type="date" value={form.sowing_date}
                onChange={(e) => setForm((f) => ({ ...f, sowing_date: e.target.value }))} />

              <div className="grid grid-cols-2 gap-3">
                <InputField label={t('field_latitude')} id="latitude" type="number" value={form.latitude}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                  placeholder="e.g. 16.5062" step="0.00001" />
                <InputField label={t('field_longitude')} id="longitude" type="number" value={form.longitude}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                  placeholder="e.g. 80.6480" step="0.00001" />
              </div>

              <GlassButton type="button" icon={LocateFixed} variant="ghost" size="sm" onClick={geoLocate}
                className="w-full border border-mint/30">
                {t('field_location_hint')}
              </GlassButton>

              <div className="flex gap-2 pt-2">
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
