// Shared UI primitives

import type { ReactNode } from 'react'

/* ── Page wrapper ──────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ── Stat card ─────────────────────────────────────────────────────────── */
export function StatCard({ label, value, icon: Icon, color = 'blue', sub }: {
  label: string; value: number | string; icon: React.ElementType;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'; sub?: string
}) {
  const palette = {
    blue:   { bg: 'bg-primary-50',   icon: 'text-primary-600',  border: 'border-primary-100' },
    green:  { bg: 'bg-emerald-50',   icon: 'text-emerald-600',  border: 'border-emerald-100' },
    amber:  { bg: 'bg-amber-50',     icon: 'text-amber-600',    border: 'border-amber-100' },
    red:    { bg: 'bg-red-50',       icon: 'text-red-500',      border: 'border-red-100' },
    purple: { bg: 'bg-purple-50',    icon: 'text-purple-600',   border: 'border-purple-100' },
    gray:   { bg: 'bg-gray-50',      icon: 'text-gray-500',     border: 'border-gray-200' },
  }
  const p = palette[color]
  return (
    <div className={`bg-white rounded-xl border ${p.border} p-5 flex items-start gap-4`}>
      <div className={`${p.bg} rounded-lg p-2.5 flex-shrink-0`}>
        <Icon size={20} className={p.icon} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className="text-xs font-medium text-gray-500 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-gray-400 mt-1">{sub}</div>}
      </div>
    </div>
  )
}

/* ── Card ──────────────────────────────────────────────────────────────── */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-100 ${className}`}>{children}</div>
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">{children}</div>
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}

/* ── Table ─────────────────────────────────────────────────────────────── */
export function Table({ headers, children, empty }: {
  headers: string[]; children: ReactNode; empty?: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {headers.map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty
            ? <tr><td colSpan={headers.length} className="text-center py-12 text-gray-400 text-sm">No records found</td></tr>
            : children}
        </tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-gray-50 last:border-0 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>
}

/* ── Badge ─────────────────────────────────────────────────────────────── */
export function Badge({ label, color }: { label: string; color: 'green' | 'blue' | 'amber' | 'red' | 'gray' }) {
  const c = {
    green: 'bg-emerald-50 text-emerald-700',
    blue:  'bg-primary-50 text-primary-600',
    amber: 'bg-amber-50 text-amber-700',
    red:   'bg-red-50 text-red-600',
    gray:  'bg-gray-100 text-gray-600',
  }[color]
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c}`}>{label}</span>
}

/* ── Button ────────────────────────────────────────────────────────────── */
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled = false, type = 'button', className = '' }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md'; disabled?: boolean; type?: 'button' | 'submit'; className?: string
}) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const sz   = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
  const v = {
    primary:   'bg-primary text-white hover:bg-primary-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger:    'bg-red-50 text-red-600 hover:bg-red-100',
    ghost:     'text-gray-600 hover:bg-gray-100',
  }[variant]
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sz} ${v} ${className}`}>{children}</button>
}

/* ── Input ─────────────────────────────────────────────────────────────── */
export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const { label, error, className = '', ...rest } = props
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-700">{label}</label>}
      <input
        {...rest}
        className={`border ${error ? 'border-red-400' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white ${className}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const { label, className = '', ...rest } = props
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-700">{label}</label>}
      <select
        {...rest}
        className={`border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white ${className}`}
      />
    </div>
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, className = '', ...rest } = props
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-700">{label}</label>}
      <textarea
        {...rest}
        className={`border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white resize-none ${className}`}
      />
    </div>
  )
}

/* ── Pagination ────────────────────────────────────────────────────────── */
export function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void
}) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-500">{total.toLocaleString()} total</span>
      <div className="flex items-center gap-1">
        <Btn variant="secondary" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>Prev</Btn>
        <span className="px-3 text-xs text-gray-600 font-medium">{page + 1} / {pages}</span>
        <Btn variant="secondary" size="sm" disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>Next</Btn>
      </div>
    </div>
  )
}

/* ── Status badge helpers ──────────────────────────────────────────────── */
export function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: 'green' | 'blue' | 'amber' | 'red' | 'gray' }> = {
    premium: { label: 'Premium', color: 'green' },
    trial:   { label: 'Trial',   color: 'blue' },
    expired: { label: 'Expired', color: 'red' },
    none:    { label: 'None',    color: 'gray' },
  }
  const m = map[status] ?? { label: status, color: 'gray' as const }
  return <Badge label={m.label} color={m.color} />
}

/* ── Spinner ───────────────────────────────────────────────────────────── */
export function Spinner({ size = 6 }: { size?: number }) {
  return <div className={`animate-spin rounded-full h-${size} w-${size} border-2 border-primary border-t-transparent`} />
}
