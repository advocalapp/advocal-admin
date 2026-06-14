import { useEffect, useState } from 'react'
import { getDashboardStats } from '@/lib/api'
import type { DashboardStats } from '@/types/types'
import { PageHeader, Card, CardHeader, CardBody, Spinner } from '@/components/ui'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const TYPE_COLORS: Record<string, string> = {
  Civil: '#4285F4', Criminal: '#EA4335', Family: '#34A853',
  Corporate: '#8B5CF6', Tax: '#F59E0B', Other: '#94A3B8',
  null: '#CBD5E1',
}

const NORMALIZE: Record<string, string> = {
  civil: 'Civil', criminal: 'Criminal', family: 'Family',
  corporate: 'Corporate', tax: 'Tax',
}

export default function CaseAnalyticsPage() {
  const [stats, setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(s => { setStats(s); setLoading(false) })
  }, [])

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size={8} /></div>

  const rawMap = stats?.cases_by_type ?? {}
  // Normalize case type names
  const normalized: Record<string, number> = {}
  Object.entries(rawMap).forEach(([k, v]) => {
    const label = NORMALIZE[k?.toLowerCase()] ?? (k ? k.charAt(0).toUpperCase() + k.slice(1) : 'Other')
    normalized[label] = (normalized[label] ?? 0) + (v as number)
  })

  const KNOWN = ['Civil', 'Criminal', 'Family', 'Corporate', 'Tax']
  let otherCount = normalized['Other'] ?? 0
  Object.entries(normalized).forEach(([k, v]) => {
    if (!KNOWN.includes(k) && k !== 'Other') otherCount += v
  })

  const chartData = [
    ...KNOWN.map(k => ({ name: k, count: normalized[k] ?? 0, color: TYPE_COLORS[k] })),
    { name: 'Other', count: otherCount, color: TYPE_COLORS['Other'] },
  ].filter(d => d.count > 0)

  const total = chartData.reduce((s, d) => s + d.count, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Case Analytics" subtitle={`${total.toLocaleString()} total cases across all case types`} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Bar chart */}
        <Card>
          <CardHeader>
            <span className="text-sm font-semibold text-gray-800">Cases by Type</span>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="count" name="Cases" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader>
            <span className="text-sm font-semibold text-gray-800">Case Type Distribution</span>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="count">
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {chartData.map(d => (
          <div key={d.name} className="bg-white rounded-xl border border-gray-100 px-4 py-4">
            <div className="w-3 h-3 rounded-full mb-3" style={{ background: d.color }} />
            <div className="text-2xl font-bold text-gray-900">{d.count.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">{d.name}</div>
            <div className="text-[10px] text-gray-400 mt-1">
              {total > 0 ? `${Math.round((d.count / total) * 100)}%` : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
