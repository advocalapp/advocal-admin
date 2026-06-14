import { useEffect, useState, useCallback } from 'react'
import { getActivityLogs } from '@/lib/api'
import type { ActivityLog } from '@/types/types'
import {
  PageHeader, Card, CardHeader, CardBody, Table, Tr, Td,
  Badge, Pagination, Spinner,
} from '@/components/ui'
import { Search } from 'lucide-react'

const LOG_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'user_login', label: 'User Login' },
  { key: 'case_created', label: 'Case Creation' },
  { key: 'subscription_change', label: 'Subscription' },
  { key: 'notification_sent', label: 'Notifications' },
  { key: 'admin_action', label: 'Admin Actions' },
  { key: 'suspend_user', label: 'Suspend/Reactivate' },
  { key: 'settings_update', label: 'Settings' },
]

const typeColor = (t: string): 'blue' | 'green' | 'amber' | 'red' | 'gray' => {
  if (t === 'user_login')          return 'blue'
  if (t === 'case_created')        return 'green'
  if (t === 'subscription_change') return 'amber'
  if (t === 'notification_sent')   return 'purple' as any
  if (t.includes('suspend'))       return 'red'
  return 'gray'
}

export default function ActivityLogsPage() {
  const [logs, setLogs]       = useState<ActivityLog[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(0)
  const [type, setType]       = useState('all')
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, count } = await getActivityLogs(page, 30, type, search)
    setLogs(data); setTotal(count)
    setLoading(false)
  }, [page, type, search])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Activity Logs" subtitle={`${total.toLocaleString()} log entries`} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search by email…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {LOG_TYPES.map(t => (
            <button key={t.key} onClick={() => { setType(t.key); setPage(0) }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                type === t.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          {loading
            ? <div className="flex justify-center py-12"><Spinner /></div>
            : <>
              <Table
                headers={['Time', 'Actor', 'Action', 'Details']}
                empty={logs.length === 0}
              >
                {logs.map(log => (
                  <Tr key={log.id}>
                    <Td className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </Td>
                    <Td className="text-xs">
                      <div className="font-medium text-gray-800">{log.actor_email ?? 'System'}</div>
                    </Td>
                    <Td>
                      <Badge label={log.action_type.replace(/_/g, ' ')} color={typeColor(log.action_type)} />
                    </Td>
                    <Td className="text-xs text-gray-500 max-w-sm">
                      {log.action_detail
                        ? <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-[11px] truncate block">
                            {JSON.stringify(log.action_detail)}
                          </span>
                        : '—'}
                    </Td>
                  </Tr>
                ))}
              </Table>
              <Pagination page={page} total={total} pageSize={30} onChange={setPage} />
            </>
          }
        </CardBody>
      </Card>
    </div>
  )
}
