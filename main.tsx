import { useEffect, useState, useCallback } from 'react'
import { getSubscriptions, getExpiringSubscriptions } from '@/lib/api'
import type { Profile } from '@/types/types'
import {
  PageHeader, Card, CardHeader, CardBody, Table, Tr, Td,
  SubStatusBadge, Pagination, Spinner,
} from '@/components/ui'
import { AlertTriangle } from 'lucide-react'

const TABS = [
  { key: 'all',     label: 'All' },
  { key: 'premium', label: 'Paid' },
  { key: 'trial',   label: 'Trial' },
  { key: 'expired', label: 'Expired' },
  { key: 'none',    label: 'No Plan' },
]

export default function SubscriptionsPage() {
  const [tab, setTab]         = useState('all')
  const [data, setData]       = useState<Profile[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(0)
  const [loading, setLoading] = useState(true)
  const [expiring, setExpiring] = useState<Profile[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const [res, exp] = await Promise.all([
      getSubscriptions(page, 20, tab),
      getExpiringSubscriptions(7),
    ])
    setData(res.data); setTotal(res.count)
    setExpiring(exp)
    setLoading(false)
  }, [page, tab])

  useEffect(() => { load() }, [load])

  const daysLeft = (end: string | null) => {
    if (!end) return '—'
    const d = Math.ceil((new Date(end).getTime() - Date.now()) / 86400_000)
    return d < 0 ? 'Expired' : `${d} days`
  }

  const revenue = data.filter(p => p.subscription_status === 'premium').length * 999

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Subscription Management" subtitle="Track plans, expiry dates and revenue" />

      {/* Revenue summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Records', value: total },
          { label: 'Premium Users', value: data.filter(p => p.subscription_status === 'premium').length },
          { label: 'Trial Users',   value: data.filter(p => p.subscription_status === 'trial').length },
          { label: 'Est. Revenue',  value: `₹${revenue.toLocaleString('en-IN')}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 px-5 py-4">
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Expiring soon */}
      {expiring.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-amber-800 mb-1">{expiring.length} subscription{expiring.length > 1 ? 's' : ''} expiring within 7 days</div>
            <div className="flex flex-wrap gap-2">
              {expiring.map(p => (
                <span key={p.id} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {p.full_name ?? p.email ?? p.id.slice(0, 8)} · {daysLeft(p.subscription_end_date)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs + Table */}
      <Card>
        <CardHeader>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setPage(0) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === t.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >{t.label}</button>
            ))}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading
            ? <div className="flex justify-center py-12"><Spinner /></div>
            : <>
              <Table
                headers={['Name', 'Email', 'Plan', 'Status', 'Start Date', 'End Date', 'Days Left']}
                empty={data.length === 0}
              >
                {data.map(p => (
                  <Tr key={p.id}>
                    <Td><span className="font-medium">{p.full_name ?? '—'}</span></Td>
                    <Td className="text-xs text-gray-500">{p.email ?? '—'}</Td>
                    <Td className="capitalize text-xs">{p.subscription_plan}</Td>
                    <Td><SubStatusBadge status={p.subscription_status} /></Td>
                    <Td className="text-xs text-gray-500">{p.subscription_start_date ? new Date(p.subscription_start_date).toLocaleDateString('en-IN') : '—'}</Td>
                    <Td className="text-xs text-gray-500">{p.subscription_end_date ? new Date(p.subscription_end_date).toLocaleDateString('en-IN') : '—'}</Td>
                    <Td>
                      <span className={`text-xs font-semibold ${
                        daysLeft(p.subscription_end_date) === 'Expired' ? 'text-red-500' :
                        daysLeft(p.subscription_end_date) !== '—' && parseInt(daysLeft(p.subscription_end_date)) <= 7 ? 'text-amber-600' : 'text-gray-700'
                      }`}>{daysLeft(p.subscription_end_date)}</span>
                    </Td>
                  </Tr>
                ))}
              </Table>
              <Pagination page={page} total={total} pageSize={20} onChange={setPage} />
            </>
          }
        </CardBody>
      </Card>
    </div>
  )
}
