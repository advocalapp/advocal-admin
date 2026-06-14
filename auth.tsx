import { useEffect, useState, useCallback } from 'react'
import { getAdvocates, suspendUser, getAdvocateCaseCount } from '@/lib/api'
import type { Profile } from '@/types/types'
import {
  PageHeader, Card, Table, Tr, Td, SubStatusBadge, Badge,
  Btn, Input, Select, Pagination, Spinner,
} from '@/components/ui'
import { Search, UserX, UserCheck, Eye } from 'lucide-react'

type Detail = Profile & { case_count?: number }

export default function AdvocatesPage() {
  const [advocates, setAdvocates] = useState<Profile[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Detail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, count } = await getAdvocates(page, 20, search, status)
    setAdvocates(data)
    setTotal(count)
    setLoading(false)
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  const openDetail = async (a: Profile) => {
    setDetailLoading(true)
    setSelected(a)
    const count = await getAdvocateCaseCount(a.id)
    setSelected({ ...a, case_count: count })
    setDetailLoading(false)
  }

  const toggleSuspend = async (a: Profile) => {
    await suspendUser(a.id, !a.is_suspended)
    load()
    if (selected?.id === a.id) setSelected(prev => prev ? { ...prev, is_suspended: !prev.is_suspended } : null)
  }

  const subDays = (end: string | null) => {
    if (!end) return null
    const d = Math.ceil((new Date(end).getTime() - Date.now()) / 86400_000)
    return d
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Advocate Management" subtitle={`${total.toLocaleString()} registered advocates`} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search by name, email or bar no…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <Select value={status} onChange={e => { setStatus(e.target.value); setPage(0) }}>
          <option value="all">All Status</option>
          <option value="trial">Trial</option>
          <option value="premium">Premium</option>
          <option value="expired">Expired</option>
          <option value="none">None</option>
        </Select>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <Card className="flex-1 min-w-0">
          {loading
            ? <div className="flex justify-center py-16"><Spinner /></div>
            : <>
              <Table
                headers={['Name', 'Email', 'Phone', 'Bar No.', 'Status', 'Joined', 'Actions']}
                empty={advocates.length === 0}
              >
                {advocates.map(a => (
                  <Tr key={a.id} onClick={() => openDetail(a)}>
                    <Td><span className="font-medium text-gray-900">{a.full_name ?? '—'}</span></Td>
                    <Td className="text-gray-500 text-xs">{a.email ?? '—'}</Td>
                    <Td className="text-gray-500 text-xs">{(a as any).phone_number ?? '—'}</Td>
                    <Td className="text-gray-500 text-xs">{a.bar_registration_number ?? '—'}</Td>
                    <Td>
                      <div className="flex flex-col gap-1">
                        <SubStatusBadge status={a.subscription_status} />
                        {a.is_suspended && <Badge label="Suspended" color="red" />}
                      </div>
                    </Td>
                    <Td className="text-gray-400 text-xs whitespace-nowrap">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN') : '—'}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Btn size="sm" variant="ghost" onClick={() => openDetail(a)}><Eye size={13} /></Btn>
                        <Btn size="sm" variant={a.is_suspended ? 'secondary' : 'danger'} onClick={() => toggleSuspend(a)}>
                          {a.is_suspended ? <UserCheck size={13} /> : <UserX size={13} />}
                          {a.is_suspended ? 'Reactivate' : 'Suspend'}
                        </Btn>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Table>
              <Pagination page={page} total={total} pageSize={20} onChange={setPage} />
            </>
          }
        </Card>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 flex-shrink-0">
            <Card>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Profile Detail</span>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
              </div>
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm">
                    {selected.full_name?.charAt(0) ?? 'A'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{selected.full_name ?? 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{selected.email}</div>
                  </div>
                </div>
                {detailLoading
                  ? <div className="flex justify-center py-4"><Spinner /></div>
                  : <>
                    {[
                      ['Bar No.', selected.bar_registration_number ?? '—'],
                      ['Chamber', selected.chamber_name ?? '—'],
                      ['Cases', selected.case_count?.toString() ?? '—'],
                      ['Status', selected.subscription_status],
                      ['Plan', selected.subscription_plan],
                      ['Sub End', selected.subscription_end_date ? new Date(selected.subscription_end_date).toLocaleDateString('en-IN') : '—'],
                      ['Days Left', selected.subscription_end_date ? `${subDays(selected.subscription_end_date)} days` : '—'],
                      ['Joined', new Date(selected.created_at).toLocaleDateString('en-IN')],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs border-b border-gray-50 pb-2">
                        <span className="text-gray-500 font-medium">{k}</span>
                        <span className="text-gray-800 font-semibold text-right max-w-[140px] truncate">{v}</span>
                      </div>
                    ))}
                    <div className="pt-1">
                      <SubStatusBadge status={selected.subscription_status} />
                      {selected.is_suspended && <Badge label="Suspended" color="red" />}
                    </div>
                    <Btn
                      variant={selected.is_suspended ? 'secondary' : 'danger'}
                      size="sm" className="w-full justify-center mt-2"
                      onClick={() => toggleSuspend(selected)}
                    >
                      {selected.is_suspended ? <UserCheck size={13} /> : <UserX size={13} />}
                      {selected.is_suspended ? 'Reactivate Account' : 'Suspend Account'}
                    </Btn>
                  </>
                }
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
