import { useEffect, useState, useCallback } from 'react'
import {
  getNotifications, createNotification, sendPushNotification,
  getNotificationLogs, getAdvocates,
} from '@/lib/api'
import type { AdminNotification, Profile } from '@/types/types'
import {
  PageHeader, Card, CardHeader, CardBody, Table, Tr, Td,
  Badge, Btn, Input, Textarea, Select, Pagination, Spinner,
} from '@/components/ui'
import { Send, Bell, Clock, ChevronDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

type Log = { id: string; user_id: string; token: string; status: string; error_message: string | null; sent_at: string }

export default function NotificationsPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState<AdminNotification[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(0)
  const [histLoading, setHistLoading] = useState(true)

  // Form state
  const [title, setTitle]       = useState('')
  const [message, setMessage]   = useState('')
  const [audience, setAudience] = useState<'all' | 'trial' | 'premium' | 'selected'>('all')
  const [schedule, setSchedule] = useState(false)
  const [schedAt, setSchedAt]   = useState('')
  const [sending, setSending]   = useState(false)
  const [formMsg, setFormMsg]   = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Selected users
  const [users, setUsers]         = useState<Profile[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Delivery log drawer
  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [logs, setLogs]               = useState<Log[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  const loadHistory = useCallback(async () => {
    setHistLoading(true)
    const { data, count } = await getNotifications(page, 15)
    setHistory(data); setTotal(count)
    setHistLoading(false)
  }, [page])

  useEffect(() => { loadHistory() }, [loadHistory])

  useEffect(() => {
    if (audience === 'selected') {
      getAdvocates(0, 100, '', 'all').then(r => setUsers(r.data))
    }
  }, [audience])

  const toggleLogs = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id); setLogsLoading(true)
    const { data } = await getNotificationLogs(id)
    setLogs(data as Log[]); setLogsLoading(false)
  }

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setFormMsg({ type: 'error', text: 'Title and message are required.' }); return
    }
    if (audience === 'selected' && selectedIds.length === 0) {
      setFormMsg({ type: 'error', text: 'Please select at least one user.' }); return
    }
    setSending(true); setFormMsg(null)

    // 1. Insert record in admin_notifications
    const payload = {
      title, message,
      target_audience: audience,
      target_user_ids: audience === 'selected' ? selectedIds : null,
      scheduled_at: schedule && schedAt ? new Date(schedAt).toISOString() : null,
      sent_at: schedule ? null : new Date().toISOString(),
      status: (schedule ? 'scheduled' : 'pending') as any,
      created_by: user?.id ?? null,
    }
    const { data: notif, error: insertErr } = await createNotification(payload)
    if (insertErr || !notif) {
      setSending(false)
      setFormMsg({ type: 'error', text: insertErr?.message ?? 'Failed to create notification.' })
      return
    }

    if (schedule) {
      // Scheduled — just save, no immediate FCM send
      setSending(false)
      setTitle(''); setMessage(''); setSchedAt(''); setSelectedIds([])
      setFormMsg({ type: 'success', text: 'Notification scheduled successfully.' })
      loadHistory(); return
    }

    // 2. Call Edge Function to send FCM push
    const { data: result, error: sendErr } = await sendPushNotification({
      notification_id: notif.id,
      title, message,
      target_audience: audience,
      target_user_ids: audience === 'selected' ? selectedIds : null,
    })

    setSending(false)
    setTitle(''); setMessage(''); setSchedAt(''); setSelectedIds([])

    if (sendErr) {
      setFormMsg({ type: 'error', text: `Send failed: ${sendErr.message}` })
    } else {
      const r = result as any
      setFormMsg({
        type: 'success',
        text: `Sent to ${r?.sent ?? 0} device(s). ${r?.failed ? `${r.failed} failed.` : ''}`,
      })
    }
    loadHistory()
  }

  const statusColor = (s: string) => ({ sent: 'green', scheduled: 'blue', failed: 'red', pending: 'amber' }[s] ?? 'gray') as any
  const logStatusIcon = (s: string) => {
    if (s === 'sent')          return <CheckCircle size={12} className="text-green-500" />
    if (s === 'invalid_token') return <AlertCircle size={12} className="text-amber-500" />
    return <XCircle size={12} className="text-red-500" />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Push Notification Center" subtitle="Send real FCM push notifications to advocates' devices" />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* ── Compose ── */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                <span className="text-sm font-semibold text-gray-800">Compose Notification</span>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Court reminder" />
              <Textarea label="Message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Notification body…" rows={3} />

              <Select label="Target Audience" value={audience} onChange={e => setAudience(e.target.value as typeof audience)}>
                <option value="all">All Users</option>
                <option value="trial">Trial Users Only</option>
                <option value="premium">Paid Users Only</option>
                <option value="selected">Selected Users</option>
              </Select>

              {audience === 'selected' && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Select Users ({selectedIds.length} selected)
                  </label>
                  <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                        <input type="checkbox" checked={selectedIds.includes(u.id)}
                          onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, u.id] : prev.filter(x => x !== u.id))} />
                        {u.full_name ?? u.email ?? u.id.slice(0, 8)}
                      </label>
                    ))}
                    {users.length === 0 && <p className="text-[11px] text-gray-400 text-center py-2">No users found</p>}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input type="checkbox" id="sched" checked={schedule} onChange={e => setSchedule(e.target.checked)} />
                <label htmlFor="sched" className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Clock size={12} /> Schedule for later
                </label>
              </div>
              {schedule && (
                <Input type="datetime-local" label="Schedule Date & Time" value={schedAt} onChange={e => setSchedAt(e.target.value)} />
              )}

              {formMsg && (
                <div className={`px-3 py-2 rounded-lg text-xs font-medium ${formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {formMsg.text}
                </div>
              )}

              <Btn variant="primary" className="w-full justify-center" onClick={handleSend} disabled={sending}>
                {sending ? <Spinner size={4} /> : <Send size={14} />}
                {sending ? 'Sending…' : schedule ? 'Schedule Notification' : 'Send Now'}
              </Btn>
            </CardBody>
          </Card>

          {/* FCM Setup hint */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 space-y-1">
            <p className="font-semibold">🔑 FCM Setup Required</p>
            <p>Add <code className="bg-blue-100 px-1 rounded">FIREBASE_SERVICE_ACCOUNT_JSON</code> to Supabase Edge Function secrets for push delivery to work.</p>
          </div>
        </div>

        {/* ── History + Delivery Logs ── */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold text-gray-800">Notification History</span>
              <span className="text-xs text-gray-400">{total} total</span>
            </CardHeader>
            <CardBody className="p-0">
              {histLoading
                ? <div className="flex justify-center py-12"><Spinner /></div>
                : <>
                  <Table
                    headers={['Title', 'Audience', 'Status', 'Delivered', 'Sent At', '']}
                    empty={history.length === 0}
                  >
                    {history.map(n => (
                      <>
                        <Tr key={n.id}>
                          <Td>
                            <div className="font-medium text-gray-900 text-xs">{n.title}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5 max-w-40 truncate">{n.message}</div>
                          </Td>
                          <Td className="capitalize text-xs">{n.target_audience}</Td>
                          <Td><Badge label={n.status} color={statusColor(n.status)} /></Td>
                          <Td className="text-xs text-gray-600 font-medium">{n.sent_count ?? 0}</Td>
                          <Td className="text-xs text-gray-400">
                            {n.sent_at
                              ? new Date(n.sent_at).toLocaleString('en-IN')
                              : n.scheduled_at ? `Sched: ${new Date(n.scheduled_at).toLocaleString('en-IN')}` : '—'}
                          </Td>
                          <Td>
                            <button
                              onClick={() => toggleLogs(n.id)}
                              className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                            >
                              Logs <ChevronDown size={10} className={`transition-transform ${expandedId === n.id ? 'rotate-180' : ''}`} />
                            </button>
                          </Td>
                        </Tr>
                        {expandedId === n.id && (
                          <Tr key={`${n.id}-logs`}>
                            <Td colSpan={6} className="bg-gray-50 px-4 py-3">
                              {logsLoading
                                ? <div className="flex justify-center py-4"><Spinner size={4} /></div>
                                : logs.length === 0
                                  ? <p className="text-xs text-gray-400 text-center py-2">No delivery logs yet</p>
                                  : <div className="space-y-1 max-h-40 overflow-y-auto">
                                      {logs.map(l => (
                                        <div key={l.id} className="flex items-center gap-2 text-[11px] text-gray-600">
                                          {logStatusIcon(l.status)}
                                          <span className="font-mono text-gray-400 truncate max-w-36">{l.token.slice(-12)}</span>
                                          <span className="capitalize font-medium">{l.status.replace('_', ' ')}</span>
                                          {l.error_message && <span className="text-red-400 truncate max-w-48">{l.error_message}</span>}
                                          <span className="ml-auto text-gray-300">{new Date(l.sent_at).toLocaleTimeString('en-IN')}</span>
                                        </div>
                                      ))}
                                    </div>
                              }
                            </Td>
                          </Tr>
                        )}
                      </>
                    ))}
                  </Table>
                  <Pagination page={page} total={total} pageSize={15} onChange={setPage} />
                </>
              }
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
