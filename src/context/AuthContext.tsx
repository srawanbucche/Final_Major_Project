import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService, type PublicUser } from '@/services/authService'

interface AuthContextValue {
  user: PublicUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<PublicUser>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const current = await authService.currentUser()
    setUser(current)
  }, [])

  useEffect(() => {
    void refresh().finally(() => setLoading(false))
  }, [refresh])

  useEffect(() => {
    const onActivity = () => authService.touchActivity()
    window.addEventListener('click', onActivity)
    window.addEventListener('keydown', onActivity)
    const timer = window.setInterval(() => {
      void refresh()
    }, 60_000)
    return () => {
      window.removeEventListener('click', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.clearInterval(timer)
    }
  }, [refresh])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const result = await authService.login(email, password)
        setUser(result.user)
        return result.user
      },
      register: async (fullName, email, password) => {
        await authService.register({ full_name: fullName, email, password })
      },
      logout: async () => {
        await authService.logout()
        setUser(null)
      },
      refresh,
    }),
    [user, loading, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
