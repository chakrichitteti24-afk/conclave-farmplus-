/**
 * Shared Bio-Glass UI primitives
 */

import { clsx } from 'clsx'

// ── GlassCard ─────────────────────────────────────────────────────────────────
export function GlassCard({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative rounded-2xl overflow-hidden',
        'bg-white/60 backdrop-blur-md',
        'border border-white/40',
        'shadow-glass',
        'transition-all duration-300 ease-out',
        onClick && 'cursor-pointer hover:shadow-glass-lg hover:-translate-y-0.5 active:scale-[0.99]',
        className
      )}
    >
      {children}
    </div>
  )
}

// ── GlassButton ───────────────────────────────────────────────────────────────
export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  icon: Icon,
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
    'transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2'

  const variants = {
    primary:
      'bg-gradient-to-br from-emerald-mid to-mint text-white shadow-glass hover:shadow-glass-lg hover:brightness-110',
    secondary:
      'bg-white/70 backdrop-blur-sm border border-white/60 text-emerald-deep shadow-glass-sm hover:bg-white/90',
    danger:
      'bg-gradient-to-br from-coral to-red-600 text-white shadow-glass hover:brightness-110',
    amber:
      'bg-gradient-to-br from-amber to-amber-dark text-white shadow-glass hover:brightness-110',
    ghost:
      'bg-transparent hover:bg-white/40 text-emerald-deep',
  }

  const sizes = {
    sm:  'px-3 py-1.5 text-sm',
    md:  'px-5 py-2.5 text-sm',
    lg:  'px-6 py-3 text-base',
    xl:  'px-8 py-4 text-lg',
    icon:'p-2.5',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, severity = 'low', className = '' }) {
  const sevColors = {
    low:      'bg-mint/20 text-emerald-deep border-mint/40',
    medium:   'bg-amber/20 text-amber-dark border-amber/40',
    high:     'bg-coral/20 text-coral-dark border-coral/40',
    critical: 'bg-coral text-white border-coral',
    none:     'bg-mint-pale text-emerald-deep border-mint/30',
    pass:     'bg-mint/20 text-emerald-deep border-mint/40',
    fail:     'bg-coral/20 text-coral-dark border-coral/40',
    error:    'bg-amber/20 text-amber-dark border-amber/40',
    pending:  'bg-gray-200 text-gray-600 border-gray-300',
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide',
        sevColors[severity] ?? sevColors.low,
        className
      )}
    >
      {label}
    </span>
  )
}

// ── StressMeter ───────────────────────────────────────────────────────────────
export function StressMeter({ score = 0, level = 'none' }) {
  const color = {
    none:     'from-mint to-mint-light',
    low:      'from-mint to-mint',
    medium:   'from-amber-light to-amber',
    high:     'from-amber to-coral',
    critical: 'from-coral to-coral-dark',
  }[level] ?? 'from-mint to-mint'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500 font-medium">
        <span>0</span>
        <span className="font-bold text-emerald-deep">{score.toFixed(0)}/100</span>
        <span>100</span>
      </div>
      <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-white/40 shadow-inner">
        <div
          className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out', color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  )
}

// ── InputField ────────────────────────────────────────────────────────────────
export function InputField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
  step,
  error,
  hint,
  className = '',
}) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-emerald-deep uppercase tracking-wide">
          {label}{required && <span className="text-coral ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl text-sm',
          'bg-white/70 backdrop-blur-sm border',
          'placeholder:text-gray-400 text-gray-800',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-mint focus:border-mint',
          error
            ? 'border-coral/60 bg-coral/5'
            : 'border-white/60 hover:border-mint/50',
        )}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-coral font-medium">{error}</p>}
    </div>
  )
}

// ── SelectField ───────────────────────────────────────────────────────────────
export function SelectField({ label, id, value, onChange, options = [], required, className = '' }) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-emerald-deep uppercase tracking-wide">
          {label}{required && <span className="text-coral ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/70 backdrop-blur-sm border border-white/60 text-gray-800 focus:outline-none focus:ring-2 focus:ring-mint focus:border-mint transition-all duration-200 appearance-none"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={clsx('rounded-full border-4 border-mint/30 border-t-mint animate-spin', className)}
      style={{ width: size, height: size }}
    />
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-mint/10 flex items-center justify-center">
          <Icon size={32} className="text-mint" />
        </div>
      )}
      <p className="text-gray-600 font-semibold">{title}</p>
      {hint && <p className="text-sm text-gray-400 max-w-xs">{hint}</p>}
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-lg font-bold text-emerald-deep leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
