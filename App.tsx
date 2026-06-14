import { useEffect, useState } from 'react'
import { getSettings, updateSetting } from '@/lib/api'
import { PageHeader, Card, CardHeader, CardBody, Input, Btn, Spinner } from '@/components/ui'
import { Save, Settings, CreditCard, Clock, Bell, Palette } from 'lucide-react'

interface AppCfg  { app_name: string; app_version: string; support_email: string; support_phone: string }
interface TrialCfg { trial_duration_days: number; trial_enabled: boolean }
interface NotifCfg { hearing_reminder_enabled: boolean; reminder_hours_before: number }

interface Plan { id: string; name: string; duration_days: number; price: number; features: string[] }

export default function SettingsPage() {
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState<string | null>(null)
  const [saved, setSaved]       = useState<string | null>(null)

  const [appCfg,   setAppCfg]   = useState<AppCfg>({ app_name: 'AdvoCal', app_version: '1.0.0', support_email: '', support_phone: '' })
  const [trialCfg, setTrialCfg] = useState<TrialCfg>({ trial_duration_days: 14, trial_enabled: true })
  const [notifCfg, setNotifCfg] = useState<NotifCfg>({ hearing_reminder_enabled: true, reminder_hours_before: 24 })
  const [plans, setPlans]       = useState<Plan[]>([])

  useEffect(() => {
    getSettings().then(rows => {
      rows.forEach((r: any) => {
        if (r.key === 'app_config')         setAppCfg(r.value)
        if (r.key === 'trial_settings')     setTrialCfg(r.value)
        if (r.key === 'notification_cfg')   setNotifCfg(r.value)
        if (r.key === 'subscription_plans') setPlans(r.value)
      })
      setLoading(false)
    })
  }, [])

  const save = async (key: string, value: unknown) => {
    setSaving(key)
    await updateSetting(key, value)
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  const SaveBtn = ({ k }: { k: string }) => (
    <Btn variant="primary" size="sm" onClick={() => {
      if (k === 'app_config')         save(k, appCfg)
      if (k === 'trial_settings')     save(k, trialCfg)
      if (k === 'notification_cfg')   save(k, notifCfg)
      if (k === 'subscription_plans') save(k, plans)
    }} disabled={saving === k}>
      {saving === k ? <Spinner size={3} /> : <Save size={13} />}
      {saved === k ? 'Saved!' : 'Save'}
    </Btn>
  )

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size={8} /></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="Configure application behaviour and subscription plans" />

      <div className="space-y-5">
        {/* App config */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings size={15} className="text-primary" />
              <span className="text-sm font-semibold text-gray-800">App Configuration</span>
            </div>
            <SaveBtn k="app_config" />
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Application Name" value={appCfg.app_name} onChange={e => setAppCfg(p => ({ ...p, app_name: e.target.value }))} />
              <Input label="Application Version" value={appCfg.app_version} onChange={e => setAppCfg(p => ({ ...p, app_version: e.target.value }))} />
              <Input label="Support Email" type="email" value={appCfg.support_email} onChange={e => setAppCfg(p => ({ ...p, support_email: e.target.value }))} />
              <Input label="Support Phone" value={appCfg.support_phone} onChange={e => setAppCfg(p => ({ ...p, support_phone: e.target.value }))} />
            </div>
          </CardBody>
        </Card>

        {/* Subscription plans */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard size={15} className="text-primary" />
              <span className="text-sm font-semibold text-gray-800">Subscription Plans</span>
            </div>
            <SaveBtn k="subscription_plans" />
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {plans.map((plan, i) => (
                <div key={plan.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-3">{plan.name}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Plan Name" value={plan.name}
                      onChange={e => setPlans(p => p.map((pl, j) => j === i ? { ...pl, name: e.target.value } : pl))} />
                    <Input label="Duration (days)" type="number" value={plan.duration_days}
                      onChange={e => setPlans(p => p.map((pl, j) => j === i ? { ...pl, duration_days: Number(e.target.value) } : pl))} />
                    <Input label="Price (₹)" type="number" value={plan.price}
                      onChange={e => setPlans(p => p.map((pl, j) => j === i ? { ...pl, price: Number(e.target.value) } : pl))} />
                  </div>
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-gray-700">Features (comma-separated)</label>
                    <input
                      value={plan.features.join(', ')}
                      onChange={e => setPlans(p => p.map((pl, j) => j === i ? { ...pl, features: e.target.value.split(',').map(f => f.trim()).filter(Boolean) } : pl))}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Trial settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              <span className="text-sm font-semibold text-gray-800">Trial Duration Settings</span>
            </div>
            <SaveBtn k="trial_settings" />
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Trial Duration (days)" type="number" value={trialCfg.trial_duration_days}
                onChange={e => setTrialCfg(p => ({ ...p, trial_duration_days: Number(e.target.value) }))} />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Trial Period Enabled</label>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => setTrialCfg(p => ({ ...p, trial_enabled: true }))}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${trialCfg.trial_enabled ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                  >Enabled</button>
                  <button
                    onClick={() => setTrialCfg(p => ({ ...p, trial_enabled: false }))}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${!trialCfg.trial_enabled ? 'bg-danger text-white' : 'bg-gray-100 text-gray-600'}`}
                  >Disabled</button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Notification settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-primary" />
              <span className="text-sm font-semibold text-gray-800">Notification Settings</span>
            </div>
            <SaveBtn k="notification_cfg" />
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Reminder Hours Before Hearing" type="number" value={notifCfg.reminder_hours_before}
                onChange={e => setNotifCfg(p => ({ ...p, reminder_hours_before: Number(e.target.value) }))} />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Hearing Reminders</label>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setNotifCfg(p => ({ ...p, hearing_reminder_enabled: true }))}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${notifCfg.hearing_reminder_enabled ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                    Enabled
                  </button>
                  <button onClick={() => setNotifCfg(p => ({ ...p, hearing_reminder_enabled: false }))}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${!notifCfg.hearing_reminder_enabled ? 'bg-danger text-white' : 'bg-gray-100 text-gray-600'}`}>
                    Disabled
                  </button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette size={15} className="text-primary" />
              <span className="text-sm font-semibold text-gray-800">Branding Settings</span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" defaultValue="#4285F4" className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <span className="text-sm text-gray-500">#4285F4 (Google Blue)</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" defaultValue="#F59E0B" className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <span className="text-sm text-gray-500">#F59E0B (Amber)</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Branding color changes require a new app build to take effect on mobile clients.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
