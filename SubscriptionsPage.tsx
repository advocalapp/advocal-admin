import { useEffect, useState, useCallback } from 'react'
import { getDashboardStats, getUserGrowth, getTopAdvocates } from '@/lib/api'
import type { DashboardStats } from '@/types/types'
import { PageHeader, Card, CardHeader, CardBody, Spinner } from '@/components/ui'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#4285F4', '#34A853', '#F59E0B', '#EA4335', '#8B5CF6', '#06B6D4']

export default function AnalyticsPage() {
  const [stats, setStats]   = useState<DashboardStats | null>(null)
  const [growth, setGrowth] = useState<{ day: string; new_users: number }[]>([])
  const [top, setTop]       = useState<{ full_name: string; email: string; case_count: number }[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [s, g, t] = await Promise.all([getDashboardStats(), getUserGrowth(60), getTopAdvocates(10)])
    setStats(s)
    setGrowth(g.map(r => ({ ...r, day: new Date(r.day).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) })))
    setTop(t as typeof top)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size={8} /></div>

  const subPieData = [
    { name: 'Premium', value: stats?.paid_users ?? 0 },
    { name: 'Trial',   value: stats?.trial_users ?? 0 },
    { name: 'Expired', value: stats?.expired_users ?? 0 },
    { name: 'None',    value: stats?.none_users ?? 0 },
  ].filter(d => d.value > 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Analytics" subtitle="User behavior and subscription metrics" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* User growth — 60 days */}
        <Card>
          <CardHeader>
            <span className="text-sm font-semibold text-gray-800">New Registrations (Last 60 days)</span>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4285F4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Area type="monotone" dataKey="new_users" name="New Users" stroke="#4285F4" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Subscription breakdown pie */}
        <Card>
          <CardHeader>
            <span className="text-sm font-semibold text-gray-800">Subscription Distribution</span>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={subPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {subPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Top advocates */}
      <Card>
        <CardHeader>
          <span className="text-sm font-semibold text-gray-800">Most Active Advocates (by Case Count)</span>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={top.map(t => ({ name: t.full_name?.split(' ')[0] ?? t.email?.split('@')[0] ?? '?', cases: t.case_count }))} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="cases" name="Cases" fill="#4285F4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Conversion stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {[
          { label: 'Trial → Paid Conversion',
            value: stats && (stats.paid_users + stats.trial_users) > 0
              ? `${Math.round((stats.paid_users / (stats.paid_users + stats.trial_users)) * 100)}%` : '—' },
          { label: 'Churn Rate (approx.)',
            value: stats && stats.total_advocates > 0
              ? `${Math.round((stats.expired_users / stats.total_advocates) * 100)}%` : '—' },
          { label: 'Avg Cases / User',
            value: stats && stats.active_users > 0
              ? (stats.total_cases / stats.active_users).toFixed(1) : '—' },
          { label: 'Activation Rate',
            value: stats && stats.total_advocates > 0
              ? `${Math.round((stats.active_users / stats.total_advocates) * 100)}%` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 px-5 py-4">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
