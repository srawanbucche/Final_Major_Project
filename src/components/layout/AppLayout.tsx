import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNavbar } from '@/components/layout/TopNavbar'
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer'
import { CONSENT_STATEMENT } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'

export function AppLayout() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) {
    return (
      <div className="grid min-h-svh place-items-center bg-mesh">
        <p className="text-sm text-muted-foreground">Loading workspace…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!user.onboarding_complete) return <Navigate to="/onboarding" replace />

  return (
    <div className="flex min-h-svh bg-[#eef3f7]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <footer className="border-t bg-white px-6 py-4">
          <p className="text-xs text-muted-foreground">{CONSENT_STATEMENT}</p>
          <MedicalDisclaimer className="mt-1" />
        </footer>
      </div>
    </div>
  )
}
