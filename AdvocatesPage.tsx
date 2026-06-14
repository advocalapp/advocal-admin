import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import {
  LayoutDashboard, Users, CreditCard, Bell, BarChart2,
  PieChart, ScrollText, Settings, LogOut, Scale,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',      label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/advocates',      label: 'Advocates',        icon: Users },
  { to: '/subscriptions',  label: 'Subscriptions',    icon: CreditCard },
  { to: '/notifications',  label: 'Notifications',    icon: Bell },
  { to: '/analytics',      label: 'Analytics',        icon: BarChart2 },
  { to: '/case-analytics', label: 'Case Analytics',   icon: PieChart },
  { to: '/activity-logs',  label: 'Activity Logs',    icon: ScrollText },
  { to: '/settings',       label: 'Settings',         icon: Settings },
]

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Scale size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 leading-tight">AdvoCal</div>
            <div className="text-[10px] font-semibold text-primary uppercase tracking-wide">Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{user?.email}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Administrator</div>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-2 p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
