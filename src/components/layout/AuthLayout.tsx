import { Link, Navigate, Outlet } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { APP_NAME, APP_TAGLINE, LANDING_DISCLAIMER } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'

export function AuthLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-svh place-items-center">Loading…</div>
  if (user) {
    return <Navigate to={user.onboarding_complete ? '/dashboard' : '/onboarding'} replace />
  }

  return (
    <div className="grid min-h-svh bg-mesh lg:grid-cols-2">
      <div className="hidden flex-col justify-between p-10 text-white lg:flex" style={{ background: 'linear-gradient(160deg,#0b1f3a,#1a4c5c)' }}>
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <Shield className="h-6 w-6 text-teal-300" />
          {APP_NAME}
        </Link>
        <div>
          <h2 className="text-3xl font-bold">{APP_TAGLINE}</h2>
          <p className="mt-4 max-w-md text-white/80">{LANDING_DISCLAIMER}</p>
        </div>
        <p className="text-sm text-white/60">Consent-first. No third-party passwords. Not a medical diagnosis.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
