import { NavLink } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Database,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { cn } from '@/lib/utils'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/data-sources', label: 'Data Sources', icon: Database },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/analysis', label: 'Analysis', icon: Sparkles },
  { to: '/trends', label: 'Trends', icon: Activity },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/privacy-consent', label: 'Privacy & Consent', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      {open ? (
        <button
          className="fixed inset-0 z-30 bg-navy/40 lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="text-lg font-extrabold tracking-tight">{APP_NAME}</p>
            <p className="text-xs text-sidebar-muted">{APP_TAGLINE}</p>
          </div>
          <button className="lg:hidden" onClick={onClose} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white',
                  isActive && 'bg-white/12 text-white',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs text-sidebar-muted">
          <BarChart3 className="mb-2 h-4 w-4" />
          Research screening only. Not a diagnosis.
        </div>
      </aside>
    </>
  )
}
