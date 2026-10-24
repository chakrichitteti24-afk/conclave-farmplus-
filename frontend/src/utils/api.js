/**
 * API utility — Axios instance pointed at the FarmPulse backend
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.detail ??
      err.message ??
      'Unknown error'
    return Promise.reject(new Error(msg))
  }
)

// ── Fields ────────────────────────────────────────────────────────────────────
export const fieldsApi = {
  list:   ()           => api.get('/fields').then((r) => r.data),
  create: (body)       => api.post('/fields', body).then((r) => r.data),
  update: (id, body)   => api.patch(`/fields/${id}`, body).then((r) => r.data),
  delete: (id)         => api.delete(`/fields/${id}`),
}

// ── Crop Stress ───────────────────────────────────────────────────────────────
export const cropStressApi = {
  analyze: (body) => api.post('/crop-stress/analyze', body).then((r) => r.data),
}

// ── Alerts ────────────────────────────────────────────────────────────────────
export const alertsApi = {
  list:     ()    => api.get('/alerts').then((r) => r.data),
  markRead: (ids) => api.post('/alerts/mark-read', { ids }).then((r) => r.data),
}

// ── Judge ─────────────────────────────────────────────────────────────────────
export const judgeApi = {
  builtInTests: ()      => api.get('/judge/built-in-tests').then((r) => r.data),
  runBuiltIn:   ()      => api.post('/judge/run-built-in').then((r) => r.data),
  run:          (body)  => api.post('/judge/run', body).then((r) => r.data),
  history:      ()      => api.get('/judge/results').then((r) => r.data),
}

export default api
